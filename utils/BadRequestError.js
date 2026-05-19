const { BAD_REQUEST_STATUS_CODE } = require("./errors");

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = BAD_REQUEST_STATUS_CODE;
  }
}

module.exports = BadRequestError;
