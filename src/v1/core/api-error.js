const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class ApiError extends Error {
  constructor( message, statusCode, isOperational = true, stack = '') {
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
    return new ApiError(message, StatusCodes.UNAUTHORIZED, isOperational, stack);
  }

  /**
   * badRequest
   * @param {*} message -
   * @param {*} isOperational -
   * @param {*} stack -
   * @returns
   */
  static badRequest(message, isOperational, stack) {
    return new ApiError( message, StatusCodes.BAD_REQUEST, isOperational, stack);
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
    return new ApiError(message, StatusCodes.NOT_FOUND, isOperational, stack);
  }
}

class NotFoundError extends ApiError {
  constructor(message = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND ) {
    super(message, statusCode)
  }
}

class ForbiddenError extends ApiError {
  constructor(message = ReasonPhrases.FORBIDDEN, statusCode = StatusCodes.FORBIDDEN ) {
    super(message, statusCode)
  }
}

module.exports = {
  ApiError,
  NotFoundError, 
  ForbiddenError
}
