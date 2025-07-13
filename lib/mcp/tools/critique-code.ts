import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DeepSeekService } from "../services/deepseek";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
import { z } from "zod";

interface CritiqueToolParams {
  code: string;
  language: string;
  framework?: string;
  userGoal?: string;
}

interface RelatedFile {
  path: string;
  content: string;
  relevance: string;
}

interface ChatHistoryEntry {
  message: string;
  timestamp?: string;
}

export function registerCritiqueCodeTool(server: McpServer): void {
  const deepSeekService = new DeepSeekService(
    config.togetherApiKey,
    config.togetherApiUrl,
    config.deepSeekModel,
    config.analysisTimeout
  );

  server.tool(
    "critique-code",
    {
      code: z.string().min(1),
      language: z.string().min(1),
      framework: z.string().optional(),
      userGoal: z.string().optional(),
    },
    {
      title: "Code Critique",
      description: "Analyze code for issues and suggest improvements",
    },
    async (params: CritiqueToolParams) => {
      try {
        // Log the request
        logger.info("Code critique requested", {
          codeLength: params.code.length,
          language: params.language,
          framework: params.framework,
        });

        // Validate code length
        if (params.code.length > config.maxCodeLength) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Code length exceeds maximum allowed length of ${config.maxCodeLength} characters`,
              },
            ],
            isError: true,
          };
        }

        // Analyze code using DeepSeek service
        const result = await deepSeekService.analyzeCode({
          code: params.code,
          context: {
            language: params.language,
            framework: params.framework,
            userGoal:
              params.userGoal ||
              "Analyze code for issues and suggest improvements",
            relatedFiles: [] as RelatedFile[],
          },
          chatHistory: [] as ChatHistoryEntry[],
        });

        // Format the response
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Code critique failed", { error });
        return {
          content: [
            {
              type: "text",
              text:
                error instanceof Error ? error.message : "Code critique failed",
            },
          ],
          isError: true,
        };
      }
    }
  );
}
