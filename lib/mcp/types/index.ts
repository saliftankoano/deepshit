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
export const CodeContextSchema = z.object({
  language: z.string().min(1),
  framework: z.string().optional(),
  userGoal: z.string().min(1),
  relatedFiles: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
        relevance: z.string(),
      })
    )
    .optional(),
});

export const ChatHistoryEntrySchema = z.object({
  message: z.string(),
  timestamp: z.string().optional(),
});

export const CodeCriticInputSchema = z.object({
  code: z.string().min(1),
  context: CodeContextSchema,
  chatHistory: z.array(ChatHistoryEntrySchema).optional(),
});

export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens: number;
  temperature: number;
  top_p: number;
  stream: boolean;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

export interface RelatedFile {
  path: string;
  content: string;
  relevance: string;
}

export interface ChatHistoryEntry {
  message: string;
  timestamp?: string;
}

export interface CodeContext {
  language: string;
  framework?: string;
  userGoal: string;
  relatedFiles?: RelatedFile[];
}

export interface CodeCriticInput {
  code: string;
  context: CodeContext;
  chatHistory?: ChatHistoryEntry[];
}

export interface CriticalIssue {
  type: "security" | "performance" | "maintainability" | "readability";
  severity: "critical" | "high" | "medium" | "low";
  line_range: [number, number];
  description: string;
  explanation: string;
  fix_suggestion: string;
}

export interface Suggestion {
  type: "security" | "performance" | "maintainability" | "readability";
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

export interface AnalysisMetadata {
  analysis_time_ms: number;
  model_used: string;
  timestamp: string;
}

export interface CriticismResponse {
  overall_score: number;
  critical_issues: CriticalIssue[];
  suggestions: Suggestion[];
  alternatives: Alternative[];
  context_alignment: ContextAlignment;
  analysis_metadata: AnalysisMetadata;
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

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = "APIError";
  }
}

export class AnalysisError extends CodeCriticError {
  constructor(message: string) {
    super(message, "ANALYSIS_ERROR", 500);
  }
}
