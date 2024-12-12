const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * badRequest
   * @param {*} message -
   * @param {*} isOperational -
   * @param {*} stack -
   * @returns
   */
  static unAuthorized(message, isOperational, stack) {
    return new ApiError(StatusCodes.UNAUTHORIZED, message, isOperational, stack);
  }

  /**
   * badRequest
   * @param {*} message -
   * @param {*} isOperational -
   * @param {*} stack -
   * @returns
   */
  static badRequest(message, isOperational, stack) {
    return new ApiError(StatusCodes.BAD_REQUEST, message, isOperational, stack);
  }

  /**
   * notFound
   * @param {*} message -
   * @param {*} isOperational -
   * @param {*} stack -
   * @returns
   */
  // eslint-disable-next-line default-param-last
  static notFound(message = ReasonPhrases.NOT_FOUND, isOperational, stack) {
    return new ApiError(StatusCodes.NOT_FOUND, message, isOperational, stack);
  }
}

module.exports = ApiError;
