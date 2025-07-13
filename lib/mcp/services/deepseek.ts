import axios, { AxiosResponse } from "axios";
import {
  DeepSeekRequest,
  DeepSeekResponse,
  APIError,
  CodeCriticInput,
  CriticismResponse,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

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
        analysis = this.createFallbackResponse(input, content);
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

  private validateAndNormalizeResponse(response: any): CriticismResponse {
    // Validate required fields and provide defaults
    const analysis: CriticismResponse = {
      overall_score: Math.min(10, Math.max(1, response.overall_score || 5)),
      critical_issues: Array.isArray(response.critical_issues)
        ? response.critical_issues
        : [],
      suggestions: Array.isArray(response.suggestions)
        ? response.suggestions
        : [],
      alternatives: Array.isArray(response.alternatives)
        ? response.alternatives
        : [],
      context_alignment: {
        alignment_score: Math.min(
          10,
          Math.max(1, response.context_alignment?.alignment_score || 5)
        ),
        goal_analysis:
          response.context_alignment?.goal_analysis || "Analysis not available",
        recommendations: Array.isArray(
          response.context_alignment?.recommendations
        )
          ? response.context_alignment.recommendations
          : [],
      },
      analysis_metadata: {
        analysis_time_ms: 0,
        model_used: this.model,
        timestamp: new Date().toISOString(),
      },
    };

    // Normalize issues
    analysis.critical_issues = analysis.critical_issues.map((issue) => ({
      type: [
        "security",
        "performance",
        "maintainability",
        "readability",
      ].includes(issue.type)
        ? issue.type
        : "readability",
      severity: ["critical", "high", "medium", "low"].includes(issue.severity)
        ? issue.severity
        : "medium",
      line_range:
        Array.isArray(issue.line_range) && issue.line_range.length === 2
          ? issue.line_range
          : [1, 1],
      description: issue.description || "Issue detected",
      explanation: issue.explanation || "No explanation provided",
      fix_suggestion: issue.fix_suggestion || "No suggestion provided",
    }));

    return analysis;
  }

  private createFallbackResponse(
    input: CodeCriticInput,
    content: string
  ): CriticismResponse {
    return {
      overall_score: 5,
      critical_issues: [
        {
          type: "readability",
          severity: "medium",
          line_range: [1, input.code.split("\n").length],
          description: "Analysis parsing failed",
          explanation:
            "The AI response could not be parsed properly. Please try again.",
          fix_suggestion:
            "Re-run the analysis or check the code for syntax errors.",
        },
      ],
      suggestions: [],
      alternatives: [],
      context_alignment: {
        alignment_score: 5,
        goal_analysis: "Could not analyze goal alignment due to parsing error",
        recommendations: ["Re-run the analysis", "Check code syntax"],
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
