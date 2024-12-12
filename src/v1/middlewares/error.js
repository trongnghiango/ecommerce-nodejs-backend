const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../core/api-error');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || StatusCodes[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
    console.error(err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // if (config.env === 'development') {
  //   // eslint-disable-next-line no-console
  //   console.error(err);
  // }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
