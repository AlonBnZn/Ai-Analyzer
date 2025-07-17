import fs from "fs";
import path from "path";

export class Logger {
  private static logLevel = process.env.LOG_LEVEL || "info";
  private static logDir = path.join(process.cwd(), "logs");

  private static levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  static {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private static shouldLog(level: keyof typeof Logger.levels): boolean {
    return (
      Logger.levels[level] <=
      Logger.levels[Logger.logLevel as keyof typeof Logger.levels]
    );
  }

  private static formatMessage(
    level: string,
    message: string,
    data?: any
  ): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
    }

    return formattedMessage;
  }

  private static writeToFile(level: string, formattedMessage: string): void {
    const logFile = path.join(Logger.logDir, `${level}.log`);
    const allLogFile = path.join(Logger.logDir, "all.log");

    fs.appendFileSync(logFile, formattedMessage + "\n");
    fs.appendFileSync(allLogFile, formattedMessage + "\n");
  }

  static error(message: string, data?: any): void {
    if (!Logger.shouldLog("error")) return;

    const formattedMessage = Logger.formatMessage("error", message, data);
    console.error(formattedMessage);
    Logger.writeToFile("error", formattedMessage);
  }

  static warn(message: string, data?: any): void {
    if (!Logger.shouldLog("warn")) return;

    const formattedMessage = Logger.formatMessage("warn", message, data);
    console.warn(formattedMessage);
    Logger.writeToFile("warn", formattedMessage);
  }

  static info(message: string, data?: any): void {
    if (!Logger.shouldLog("info")) return;

    const formattedMessage = Logger.formatMessage("info", message, data);
    console.log(formattedMessage);
    Logger.writeToFile("info", formattedMessage);
  }

  static debug(message: string, data?: any): void {
    if (!Logger.shouldLog("debug")) return;

    const formattedMessage = Logger.formatMessage("debug", message, data);
    console.log(formattedMessage);
    Logger.writeToFile("debug", formattedMessage);
  }
}
