import pino, { type Logger } from "pino";

export const logger: Logger =
  process.env["NODE_ENV"] === "production"
    ? // JSON in production
    pino({ level: "warn" })
    : // Pretty print in development
    pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
      level: "debug",
    });


// Then in each file where you want to log, import logger and create a child logger. 
// This allows you to set attributes which appear on every log line, which we use to identify the module:
// import { logger } from "@/lib/logger";
// const log = logger.child({ module: "totoro" });

// Logging
// log.debug("called");

// And if we want to include additional attributes then they come first:
// log.debug({ "magic": "hats" }, "a log line");

// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');
// logger.debug('debug');
// logger.trace('trace');