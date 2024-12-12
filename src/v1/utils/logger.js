const { createLogger, format, transports } = require('winston');

module.exports = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.align(),
    format.printf((i) => `${[i.timestamp]}::${i.level}: ${i.message}`)
  ),
  transports: [
    new transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: format.combine(
        format.printf((i) =>
          i.level === 'info' ? `${[i.timestamp]}::${i.level}: ${i.message}` : ''
        )
      ),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
});
