import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

// Ensure the log directory exists
const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Custom format to capture error information
const withErrorField = format((info) => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      error: {
        kind: info.name,
        message: info.message,
        stack: info.stack,
      },
    });
  }
  return info;
});

const httpTransportOptions = {
  host: "http-intake.logs.datadoghq.eu",
  path: "/api/v2/logs?dd-api-key=51cf7ed4c9b00354351c32f6dbe4026c&ddsource=nodejs&service=fakestore",
  ssl: true,
};

const logger = createLogger({
  level: "info",
  exitOnError: false,
  format: format.combine(
    withErrorField(),
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }),
    new transports.File({
        filename: path.join(logDirectory, 'log.log'),
    }),
    new transports.Http(httpTransportOptions)
  ],
});

export default logger;
