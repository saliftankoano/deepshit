import { NextRequest, NextResponse } from "next/server";
import { healthCheck } from "@/lib/mcp/server";
import { DeepSeekService } from "@/lib/mcp/services/deepseek";
import { CodeCriticInputSchema, ValidationError } from "@/lib/mcp/types";
import { logger } from "@/lib/mcp/utils/logger";
import { config } from "@/lib/mcp/utils/config";

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
        throw new ValidationError(
          `Code length exceeds maximum allowed length of ${config.maxCodeLength} characters`
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
  try {
    const isHealthy = await healthCheck();

    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      service: "DeepShit MCP Code Critic",
      version: "1.0.0",
      api: "critique",
      mcp: "Available at /api/mcp endpoint",
    });
  } catch (error) {
    logger.error("Health check error", { error });
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
