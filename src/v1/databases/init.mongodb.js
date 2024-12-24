const mongoose = require('mongoose');
const { logger } = require('../utils/logger.util');

//
mongoose.set('strictQuery', false);

// connect mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
    minPoolSize: 5, // Số lượng kết nối tối thiểu trong pool
    // useFindAndModify: true,
    socketTimeoutMS: 45000,
    retryWrites: true, // Cho phép tự động thử lại các ghi khi thất bại.
  })
  .then((_) => logger.info('Connected mongoose success!...', { label: 'MONGO' }))
  .catch((err) => logger.error(`Error: connect:::${err.message}`, { label: 'MONGO' }));

// all executed methods log output to console
mongoose.set('debug', true);

// disable colors in debug mode
mongoose.set('debug', { color: true });

// get mongodb-shell friendly output (ISODate)
mongoose.set('debug', { shell: true });

module.exports = mongoose;
