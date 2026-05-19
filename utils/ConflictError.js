const { CONFLICT_ERROR_STATUS_CODE } = require("./errors");

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = CONFLICT_ERROR_STATUS_CODE;
  }
}

module.exports = ConflictError;
