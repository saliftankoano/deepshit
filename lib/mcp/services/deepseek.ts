import axios, { AxiosResponse } from "axios";
import {
  DeepSeekRequest,
  DeepSeekResponse,
  APIError,
  CodeCriticInput,
  CriticismResponse,
  CriticalIssue,
  Suggestion,
  Alternative,
} from "../types";
import { logger } from "../utils/logger";

export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private timeout: number;

  constructor(
    apiKey: string,
    apiUrl: string = "https://api.together.ai/v1",
    model: string = "deepseek-ai/DeepSeek-R1-0528-tput",
    timeout: number = 30000
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
    this.timeout = timeout;
  }

  private createSystemPrompt(): string {
    return `You are DeepShit, an expert code critic and analyzer. Your role is to provide comprehensive, context-aware feedback on code quality, security, and best practices.
Be brutally honest and unapologetic.

ANALYSIS AREAS:
1. SECURITY: Identify vulnerabilities, potential attack vectors, and security anti-patterns
2. PERFORMANCE: Detect bottlenecks, inefficient algorithms, and optimization opportunities
3. MAINTAINABILITY: Assess code structure, complexity, and long-term maintainability
4. READABILITY: Evaluate naming conventions, code clarity, and documentation
5. BEST PRACTICES: Check adherence to language/framework-specific conventions

RESPONSE FORMAT:
You must respond with a valid JSON object matching this exact structure:
{
  "overall_score": number (1-10),
  "critical_issues": [
    {
      "type": "security|performance|maintainability|readability",
      "severity": "critical|high|medium|low",
      "line_range": [start_line, end_line],
      "description": "Brief description",
      "explanation": "Detailed explanation",
      "fix_suggestion": "How to fix it"
    }
  ],
  "suggestions": [
    {
      "type": "security|performance|maintainability|readability",
      "description": "Improvement suggestion",
      "line_range": [start_line, end_line],
      "impact": "Expected impact"
    }
  ],
  "alternatives": [
    {
      "description": "Alternative approach",
      "code_example": "Code example",
      "benefits": ["benefit1", "benefit2"],
      "trade_offs": ["tradeoff1", "tradeoff2"]
    }
  ],
  "context_alignment": {
    "alignment_score": number (1-10),
    "goal_analysis": "How well code achieves user's goal",
    "recommendations": ["rec1", "rec2"]
  }
}

INSTRUCTIONS:
- Be constructive and educational in your feedback
- Provide specific, actionable suggestions
- Consider the user's stated goal and project context
- Focus on the most impactful issues first
- Line numbers should be 1-indexed
- Always return valid JSON`;
  }

  private createUserPrompt(input: CodeCriticInput): string {
    const { code, context, chatHistory } = input;

    let prompt = `CODE TO ANALYZE:
\`\`\`${context.language}
${code}
\`\`\`

USER GOAL: ${context.userGoal}
LANGUAGE: ${context.language}`;

    if (context.framework) {
      prompt += `\nFRAMEWORK: ${context.framework}`;
    }

    if (context.relatedFiles && context.relatedFiles.length > 0) {
      prompt += `\n\nRELATED FILES CONTEXT:`;
      context.relatedFiles.forEach((file, index) => {
        prompt += `\n${index + 1}. ${file.path} (${file.relevance}):\n\`\`\`${
          context.language
        }\n${file.content}\n\`\`\``;
      });
    }

    if (chatHistory && chatHistory.length > 0) {
      prompt += `\n\nCHAT HISTORY CONTEXT:`;
      chatHistory.slice(-5).forEach((entry, index) => {
        prompt += `\n${index + 1}. ${entry.message}`;
      });
    }

    prompt += `\n\nPlease analyze this code and provide detailed feedback focusing on security, performance, maintainability, readability, and best practices.`;

    return prompt;
  }

  async analyzeCode(input: CodeCriticInput): Promise<CriticismResponse> {
    const startTime = Date.now();

    try {
      const request: DeepSeekRequest = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.createSystemPrompt(),
          },
          {
            role: "user",
            content: this.createUserPrompt(input),
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
        stream: false,
      };

      logger.info("Sending request to DeepSeek API", {
        model: this.model,
        codeLength: input.code.length,
        language: input.context.language,
      });

      const response: AxiosResponse<DeepSeekResponse> = await axios.post(
        `${this.apiUrl}/chat/completions`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: this.timeout,
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new APIError("No response from DeepSeek API");
      }

      const content = response.data.choices[0].message.content;
      let analysis: CriticismResponse;

      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        analysis = this.validateAndNormalizeResponse(parsedResponse);
      } catch (parseError) {
        logger.error("Failed to parse DeepSeek response", {
          content,
          error: parseError,
        });

        // Fallback: Create a basic response if parsing fails
        analysis = this.createFallbackResponse();
      }

      // Add metadata
      analysis.analysis_metadata = {
        analysis_time_ms: Date.now() - startTime,
        model_used: this.model,
        timestamp: new Date().toISOString(),
      };

      logger.info("DeepSeek analysis completed", {
        analysisTime: analysis.analysis_metadata.analysis_time_ms,
        overallScore: analysis.overall_score,
        criticalIssues: analysis.critical_issues.length,
        suggestions: analysis.suggestions.length,
      });

      return analysis;
    } catch (error) {
      logger.error("DeepSeek API error", { error, model: this.model });

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || error.message;
        throw new APIError(`DeepSeek API error: ${message}`, status);
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new APIError(`DeepSeek analysis failed: ${errorMessage}`);
    }
  }

  private validateAndNormalizeResponse(response: unknown): CriticismResponse {
    // Validate required fields and provide defaults
    const analysis: CriticismResponse = {
      overall_score: Math.min(
        10,
        Math.max(
          1,
          ((response as Record<string, unknown>).overall_score as number) || 5
        )
      ),
      critical_issues: Array.isArray(
        (response as Record<string, unknown>).critical_issues
      )
        ? ((response as Record<string, unknown>)
            .critical_issues as CriticalIssue[])
        : [],
      suggestions: Array.isArray(
        (response as Record<string, unknown>).suggestions
      )
        ? ((response as Record<string, unknown>).suggestions as Suggestion[])
        : [],
      alternatives: Array.isArray(
        (response as Record<string, unknown>).alternatives
      )
        ? ((response as Record<string, unknown>).alternatives as Alternative[])
        : [],
      context_alignment: {
        alignment_score: Math.min(
          10,
          Math.max(
            1,
            ((
              (response as Record<string, unknown>).context_alignment as Record<
                string,
                unknown
              >
            )?.alignment_score as number) || 5
          )
        ),
        goal_analysis:
          ((
            (response as Record<string, unknown>).context_alignment as Record<
              string,
              unknown
            >
          )?.goal_analysis as string) || "Analysis not available",
        recommendations: Array.isArray(
          (
            (response as Record<string, unknown>).context_alignment as Record<
              string,
              unknown
            >
          )?.recommendations
        )
          ? ((
              (response as Record<string, unknown>).context_alignment as Record<
                string,
                unknown
              >
            ).recommendations as string[])
          : [],
      },
      analysis_metadata: {
        analysis_time_ms: 0,
        model_used: this.model,
        timestamp: new Date().toISOString(),
      },
    };

    return analysis;
  }

  private createFallbackResponse(): CriticismResponse {
    return {
      overall_score: 5,
      critical_issues: [
        {
          type: "readability",
          severity: "medium",
          line_range: [1, 1],
          description: "Failed to analyze code",
          explanation: "The AI model failed to analyze the code properly",
          fix_suggestion: "Please try again or check the code format",
        },
      ],
      suggestions: [],
      alternatives: [],
      context_alignment: {
        alignment_score: 5,
        goal_analysis: "Analysis failed",
        recommendations: ["Try again with a smaller code sample"],
      },
      analysis_metadata: {
        analysis_time_ms: 0,
        model_used: this.model,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      logger.error("DeepSeek health check failed", { error });
      return false;
    }
  }
}
