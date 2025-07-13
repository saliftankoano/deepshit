#!/usr/bin/env node

import { startServer } from "./server";
import { logger } from "./utils/logger";

process.title = "deepshit-mcp-code-critic";

async function main() {
  try {
    logger.info("Starting DeepShit MCP Code Critic server...");
    await startServer();

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM signal, shutting down...");
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("Received SIGINT signal, shutting down...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start MCP server", { error });
    process.exit(1);
  }
}

main();
