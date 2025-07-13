import { z } from "zod";

// Core analysis types
export type IssueType =
  | "security"
  | "performance"
  | "maintainability"
  | "readability";
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type SupportedLanguage = "typescript" | "javascript";

// Input schemas
export const CodeCriticInputSchema = z.object({
  code: z.string().min(10, "Code cannot be empty"),
  context: z.object({
    userGoal: z.string().min(10, "User goal is required"),
    relatedFiles: z
      .array(
        z.object({
          path: z.string(),
          content: z.string(),
          relevance: z.string(),
        })
      )
      .optional()
      .default([]),
    language: z.enum(["typescript", "javascript"]),
    framework: z.string().optional(),
  }),
  chatHistory: z
    .array(
      z.object({
        message: z.string(),
        timestamp: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type CodeCriticInput = z.infer<typeof CodeCriticInputSchema>;

// Analysis result types
export interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  line_range: [number, number];
  description: string;
  explanation: string;
  fix_suggestion: string;
}

export interface Suggestion {
  type: IssueType;
  description: string;
  line_range: [number, number];
  impact: string;
}

export interface Alternative {
  description: string;
  code_example: string;
  benefits: string[];
  trade_offs: string[];
}

export interface ContextAlignment {
  alignment_score: number;
  goal_analysis: string;
  recommendations: string[];
}

export interface CriticismResponse {
  overall_score: number;
  critical_issues: Issue[];
  suggestions: Suggestion[];
  alternatives: Alternative[];
  context_alignment: ContextAlignment;
  analysis_metadata: {
    analysis_time_ms: number;
    model_used: string;
    timestamp: string;
  };
}

// DeepSeek API types
export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// Configuration types
export interface ServerConfig {
  togetherApiKey: string;
  togetherApiUrl: string;
  deepSeekModel: string;
  port: number;
  logLevel: string;
  maxCodeLength: number;
  analysisTimeout: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  corsAllowOrigin?: string;
}

// Error types
export class CodeCriticError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "CodeCriticError";
  }
}

export class ValidationError extends CodeCriticError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class APIError extends CodeCriticError {
  constructor(message: string, statusCode: number = 500) {
    super(message, "API_ERROR", statusCode);
  }
}

export class AnalysisError extends CodeCriticError {
  constructor(message: string) {
    super(message, "ANALYSIS_ERROR", 500);
  }
}
