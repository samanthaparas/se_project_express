const { isCelebrateError } = require("celebrate");
const {
  BAD_REQUEST_STATUS_CODE,
  INTERNAL_SERVER_ERROR_STATUS_CODE,
} = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  const statusCode = isCelebrateError(err)
    ? BAD_REQUEST_STATUS_CODE
    : err.statusCode || INTERNAL_SERVER_ERROR_STATUS_CODE;

  res.status(statusCode).send({
    message:
      statusCode === INTERNAL_SERVER_ERROR_STATUS_CODE
        ? "An error has occurred on the server."
        : err.message,
  });
};
module.exports = errorHandler;
