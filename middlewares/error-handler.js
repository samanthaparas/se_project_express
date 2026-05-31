const { INTERNAL_SERVER_ERROR_STATUS_CODE } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const { statusCode = INTERNAL_SERVER_ERROR_STATUS_CODE, message } = err;

  res.status(statusCode).send({
    message:
      statusCode === INTERNAL_SERVER_ERROR_STATUS_CODE
        ? "An error has occurred on the server."
        : message,
  });
};
module.exports = errorHandler;
