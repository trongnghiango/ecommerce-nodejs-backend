/**
 * @callback AsyncFunction
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */

/**
 * Wraps an async route handler to catch any promise rejections and pass them to the next error-handling middleware.
 * @param {AsyncFunction} fn - The asynchronous route handler function.
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  catchAsync,
};
