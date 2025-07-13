import "dotenv/config";
import { ServerConfig } from "../types";

export function loadConfig(): ServerConfig {
  const requiredEnvVars = ["TOGETHER_API_KEY"];

  // Check for required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    togetherApiKey: process.env.TOGETHER_API_KEY!,
    togetherApiUrl:
      process.env.TOGETHER_API_URL || "https://api.together.ai/v1",
    deepSeekModel:
      process.env.DEEPSEEK_MODEL || "deepseek-ai/DeepSeek-R1-0528-tput",
    port: parseInt(process.env.PORT || "3001", 10),
    logLevel: process.env.LOG_LEVEL || "info",
    maxCodeLength: parseInt(process.env.MAX_CODE_LENGTH || "10000", 10),
    analysisTimeout: parseInt(process.env.ANALYSIS_TIMEOUT || "30000", 10),
    cacheEnabled: process.env.CACHE_ENABLED === "true",
    cacheTtl: parseInt(process.env.CACHE_TTL || "3600", 10),
    corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN,
  };
}

export function validateConfig(config: ServerConfig): void {
  if (!config.togetherApiKey) {
    throw new Error("Together API key is required");
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error("Port must be between 1 and 65535");
  }

  if (config.maxCodeLength < 1) {
    throw new Error("Max code length must be greater than 0");
  }

  if (config.analysisTimeout < 1000) {
    throw new Error("Analysis timeout must be at least 1000ms");
  }

  if (config.cacheTtl < 1) {
    throw new Error("Cache TTL must be greater than 0");
  }
}

export const config = loadConfig();
validateConfig(config);
