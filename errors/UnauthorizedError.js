const { UNAUTHORIZED_ERROR_STATUS_CODE } = require("../utils/errors");

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED_ERROR_STATUS_CODE;
  }
}

module.exports = UnauthorizedError;
