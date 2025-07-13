import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCritiqueCodeTool } from "./tools/critique-code";
import { logger } from "./utils/logger";
import { config } from "./utils/config";

// Create the MCP server
export const server = new McpServer({
  name: "deepshit-mcp-code-critic",
  version: "1.0.0",
  description:
    "AI-powered code critic using DeepSeek-R1 for comprehensive code analysis",
});

// Register the critique code tool
registerCritiqueCodeTool(server);

// Function to start the server with stdio transport
export async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP server started successfully");

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM signal, shutting down...");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      logger.info("Received SIGINT signal, shutting down...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start MCP server", { error });
    throw error;
  }
}

// Export the server instance for external use
export { server as mcpServer };
