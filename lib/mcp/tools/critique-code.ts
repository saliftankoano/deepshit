import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DeepSeekService } from "../services/deepseek";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
import { z } from "zod";
import {
  CodeCriticInput,
  CodeCriticInputSchema,
  ValidationError,
} from "../types";

// Helper functions for validation and formatting
function validateInput(params: any): CodeCriticInput {
  try {
    return CodeCriticInputSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid input: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw new ValidationError("Invalid input format");
  }
}

function formatResponse(result: any): string {
  // Format the analysis result into a readable string
  return `Code Analysis Results:
Overall Score: ${result.overall_score}/10

Critical Issues:
${result.critical_issues
  .map(
    (issue: any) =>
      `- [${issue.severity.toUpperCase()}] ${issue.description}\n  Line ${
        issue.line_range[0]
      }-${issue.line_range[1]}: ${issue.explanation}\n  Fix: ${
        issue.fix_suggestion
      }`
  )
  .join("\n")}

Suggestions:
${result.suggestions
  .map(
    (suggestion: any) =>
      `- ${suggestion.description}\n  Impact: ${suggestion.impact}`
  )
  .join("\n")}

Alternative Implementations:
${result.alternatives
  .map(
    (alt: any) =>
      `- ${alt.description}\n  Example:\n  ${
        alt.code_example
      }\n  Benefits: ${alt.benefits.join(
        ", "
      )}\n  Trade-offs: ${alt.trade_offs.join(", ")}`
  )
  .join("\n")}

Context Alignment:
Score: ${result.context_alignment.alignment_score}/10
Analysis: ${result.context_alignment.goal_analysis}
Recommendations:
${result.context_alignment.recommendations
  .map((rec: string) => `- ${rec}`)
  .join("\n")}`;
}

// Tool registration function that will be used by the MCP server
export function registerCritiqueCodeTool(server: McpServer) {
  const deepSeekService = new DeepSeekService(
    config.togetherApiKey,
    config.togetherApiUrl,
    config.deepSeekModel,
    config.analysisTimeout
  );

  server.registerTool(
    "critique_code",
    {
      title: "Code Critic",
      description:
        "Analyze generated code for security vulnerabilities, quality issues, and best practice violations",
      inputSchema: {
        code: z.string().min(1).describe("The code to analyze"),
        context: z
          .object({
            userGoal: z
              .string()
              .min(1)
              .describe("What the user is trying to achieve with this code"),
            relatedFiles: z
              .array(
                z.object({
                  path: z.string(),
                  content: z.string(),
                  relevance: z.string(),
                })
              )
              .default([])
              .describe("Related files that provide context"),
            language: z
              .enum(["typescript", "javascript"])
              .describe("Programming language of the code"),
            framework: z
              .string()
              .optional()
              .describe("Framework being used (optional)"),
          })
          .required({
            userGoal: true,
            language: true,
          }),
        chatHistory: z
          .array(
            z.object({
              message: z.string(),
              timestamp: z.string(),
            })
          )
          .default([])
          .describe("Previous conversation history for context"),
      },
    },
    async (params: any) => {
      const startTime = Date.now();

      try {
        // Validate input
        const validatedInput = validateInput(params);

        // Log the analysis request
        logger.info("Code criticism requested", {
          codeLength: validatedInput.code.length,
          language: validatedInput.context.language,
          framework: validatedInput.context.framework,
          relatedFiles: validatedInput.context.relatedFiles?.length || 0,
          chatHistoryLength: validatedInput.chatHistory?.length || 0,
        });

        // Perform analysis
        const result = await deepSeekService.analyzeCode(validatedInput);

        // Log success
        logger.info("Code criticism completed", {
          executionTime: Date.now() - startTime,
          overallScore: result.overall_score,
          criticalIssues: result.critical_issues.length,
          suggestions: result.suggestions.length,
          alternatives: result.alternatives.length,
        });

        return {
          content: [
            {
              type: "text",
              text: formatResponse(result),
            },
          ],
        };
      } catch (error) {
        logger.error("Code criticism failed", { error });
        throw error;
      }
    }
  );
}
