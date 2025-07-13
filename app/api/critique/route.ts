import { NextRequest, NextResponse } from "next/server";
import { healthCheck } from "@/lib/mcp/server";
import { DeepSeekService } from "@/lib/mcp/services/deepseek";
import { z } from "zod";
import { logger } from "@/lib/mcp/utils/logger";
import { config } from "@/lib/mcp/utils/config";

// Create validation schema
const CodeCriticInputSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  context: z.object({
    language: z.string().min(1, "Language is required"),
    framework: z.string().optional(),
    userGoal: z.string().min(10, "User goal is required"),
    relatedFiles: z
      .array(
        z.object({
          path: z.string(),
          content: z.string(),
          relevance: z.string(),
        })
      )
      .optional(),
  }),
  chatHistory: z
    .array(
      z.object({
        message: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .optional(),
});

// Create DeepSeek service instance
const deepSeekService = new DeepSeekService(
  config.togetherApiKey,
  config.togetherApiUrl,
  config.deepSeekModel,
  config.analysisTimeout
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that we have the required fields
    if (!body.code || !body.context) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: code and context",
        },
        { status: 400 }
      );
    }

    // Validate input using schema
    try {
      const validatedInput = CodeCriticInputSchema.parse(body);

      // Additional validation
      if (validatedInput.code.length > config.maxCodeLength) {
        return NextResponse.json(
          {
            success: false,
            error: `Code length exceeds maximum allowed length of ${config.maxCodeLength} characters`,
          },
          { status: 400 }
        );
      }

      // Log the analysis request
      logger.info("Code criticism requested via HTTP API", {
        codeLength: validatedInput.code.length,
        language: validatedInput.context.language,
        framework: validatedInput.context.framework,
      });

      // Perform analysis using DeepSeek service
      const result = await deepSeekService.analyzeCode(validatedInput);

      return NextResponse.json({
        success: true,
        data: result,
        message: "Code analysis completed successfully",
      });
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationError instanceof Error
              ? validationError.message
              : "Validation failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    logger.error("Code analysis API error", { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
