import { createMcpHandler } from "@vercel/mcp-adapter";
import { server } from "@/lib/mcp/server";
import { logger } from "@/lib/mcp/utils/logger";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Create the MCP route handler
const handler = createMcpHandler(
  // Initialize server function
  async (mcpServer: McpServer) => {
    // Copy tools from our server instance to the MCP server
    mcpServer.tool = server.tool;
    mcpServer.prompt = server.prompt;
    mcpServer.resource = server.resource;
  },
  // Server options
  {
    serverInfo: {
      name: "deepshit-mcp-code-critic",
      version: "1.0.0",
    },
  },
  // Handler config
  {
    maxDuration: 800, // For Vercel Pro/Enterprise accounts
    verboseLogs: process.env.NODE_ENV === "development",
    redisUrl: process.env.REDIS_URL,
    onEvent: (event) => {
      switch (event.type) {
        case "ERROR":
          logger.error(
            event.error instanceof Error
              ? event.error.message
              : String(event.error),
            {
              context: event.context,
              source: event.source,
              stack:
                event.error instanceof Error ? event.error.stack : undefined,
            }
          );
          break;
        case "REQUEST_RECEIVED":
        case "REQUEST_COMPLETED":
          logger.info(`MCP ${event.type}`, {
            method: event.method,
            status: event.status,
          });
          break;
        case "SESSION_STARTED":
        case "SESSION_ENDED":
          logger.info(`MCP ${event.type}`, { transport: event.transport });
          break;
      }
    },
  }
);

// Export the handler for both GET and POST requests
export const GET = handler;
export const POST = handler;
