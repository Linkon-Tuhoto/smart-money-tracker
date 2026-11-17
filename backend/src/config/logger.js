
import "dotenv/config";
import pino from "pino";

export const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "email",
      "phone",
      "amount",
      "balance",
      "message",
      "req.body",
      "res.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },
});
