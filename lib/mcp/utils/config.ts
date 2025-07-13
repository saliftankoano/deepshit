import "dotenv/config";

interface Config {
  togetherApiKey: string;
  togetherApiUrl: string;
  deepSeekModel: string;
  analysisTimeout: number;
  maxCodeLength: number;
}

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY environment variable is required");
}

export const config: Config = {
  togetherApiKey: process.env.TOGETHER_API_KEY,
  togetherApiUrl: process.env.TOGETHER_API_URL || "https://api.together.ai/v1",
  deepSeekModel:
    process.env.DEEPSEEK_MODEL || "deepseek-ai/DeepSeek-R1-0528-tput",
  analysisTimeout: parseInt(process.env.ANALYSIS_TIMEOUT || "30000", 10),
  maxCodeLength: parseInt(process.env.MAX_CODE_LENGTH || "50000", 10),
};
