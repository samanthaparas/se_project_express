const { FORBIDDEN_ERROR_STATUS_CODE } = require("./errors");

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = FORBIDDEN_ERROR_STATUS_CODE;
  }
}

module.exports = ForbiddenError;
