interface LoggerOptions {
  level: "debug" | "info" | "warn" | "error";
  prefix?: string;
}

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private level: string;
  private prefix: string;
  private levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions = { level: "info" }) {
    this.level = options.level;
    this.prefix = options.prefix || "[DeepShit]";
  }

  private shouldLog(level: string): boolean {
    return (
      this.levels[level as keyof typeof this.levels] >=
      this.levels[this.level as keyof typeof this.levels]
    );
  }

  private formatMessage(
    level: string,
    message: string,
    meta?: LogMeta
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `${
      this.prefix
    } ${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  info(message: string, meta?: LogMeta): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  error(message: string, meta?: LogMeta): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, meta));
    }
  }
}

// Create a singleton instance with default options
export const logger = new Logger({
  level:
    (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
});
