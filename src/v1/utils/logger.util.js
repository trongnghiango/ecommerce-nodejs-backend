const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

class Logger {
  constructor() {
    this.setup();
  }

  /**
   *
   */
  setup() {
    const formatPrint = format.printf(
      ({
        level,
        message,
        context = 'no',
        label = 'SERVER',
        requestId = 'unknown',
        metadata = {},
        timestamp,
      }) => {
        return `${timestamp} [${level}] [${label}] - ctx:${context} - id:${requestId} - "${message}" - ${JSON.stringify(metadata)}`;
      }
    );

    this.logger = createLogger({
      format: format.combine(format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss' }), formatPrint),
      transports: [
        new transports.Console({
          level: 'silly',
          format: format.combine(format.colorize({ all: true }), formatPrint),
        }),
        new transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.info.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        }),
        new transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.error.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), formatPrint),
          level: 'error',
        }),
      ],
    });
  }

  /**
   * Log a message with a specific level.
   * @param {'info' | 'warn' | 'debug' | 'verbose' | 'error'} level - The level of the log message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  log(level, message, params = {}) {
    const logObject = { message, ...params };
    this.logger.log({ level, ...logObject });
  }

  /**
   * info message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  info(message, params = {}) {
    this.log('info', message, params);
  }

  /**
   * warning message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  warn(message, params = {}) {
    this.log('warn', message, params);
  }

  /**
   * debug message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  debug(message, params = {}) {
    this.log('debug', message, params);
  }

  /**
   * verbose message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  verbose(message, params = {}) {
    this.log('verbose', message, params);
  }

  /**
   * error message.
   * @param {string} message - The log message.
   * @param {Object} [params={}] - Additional parameters to log.
   */
  error(message, params = {}) {
    this.log('error', message, params);
  }
}

module.exports = new Logger();
