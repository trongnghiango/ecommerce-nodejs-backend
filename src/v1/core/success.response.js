// eslint-disable-next-line max-classes-per-file
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.code = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    res.set({ ...headers });
    return res.status(this.code).json(this);
  }
}

class OKResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}
module.exports = {
  SuccessResponse,
  OKResponse,
  CreatedResponse,
};
