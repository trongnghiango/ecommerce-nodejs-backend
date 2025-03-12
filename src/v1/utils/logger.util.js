const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

/**
 * @typedef {Object} LogEntry
 * @property {string} level - Mức độ log (ví dụ: 'info', 'error').
 * @property {string} message - Thông điệp log.
 * @property {string} [context='no'] - Ngữ cảnh của log (mặc định là 'no').
 * @property {string} [label='SERVER'] - Nhãn cho log (mặc định là 'SERVER').
 * @property {string} [requestId='unknown'] - ID của yêu cầu (mặc định là 'unknown').
 * @property {Object} [metadata={}] - Thông tin bổ sung đi kèm với log (mặc định là {}).
 * @property {string} timestamp - Thời gian ghi log.
 */

class Logger {
  constructor() {
    this.setup();
  }

  /**
   *
   */
  setup() {
    const formatPrint = format.printf(
      /**
       *
       * @param {LogEntry} param
       * @returns {String}
       */
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

    const infoFilter = format((info, opts) => {
      return info.level === 'info' ? info : false;
    });
    this.logger = createLogger({
      format: format.combine(format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss' }), formatPrint),
      transports: [
        // new transports.Console(),
        new transports.Console({
          level: 'silly',
          defaultMeta: { service: 'my-service-name' }, // Đặt tên dịch vụ
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
          format: format.combine(infoFilter(), formatPrint),
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
