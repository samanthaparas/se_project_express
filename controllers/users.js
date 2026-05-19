const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const user = require("../models/user");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
  CONFLICT_ERROR_STATUS_CODE,
  UNAUTHORIZED_ERROR_STATUS_CODE,
} = require("../utils/errors");

const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getUsers = (req, res, next) => {
  user
    .find({})
    .then((users) => {
      res.status(OK_STATUS_CODE).send(users);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!password) {
    return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid data"));
  }

  return bcrypt
    .hash(password, 10)
    .then((hash) => user.create({ name, avatar, email, password: hash }))
    .then((createdUser) => {
      const userObject = createdUser.toObject();
      delete userObject.password;
      res.status(CREATED_STATUS_CODE).send(userObject);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(
          createError(
            CONFLICT_ERROR_STATUS_CODE,
            "A user with this email already exists."
          )
        );
      }
      if (err.name === "ValidationError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid data"));
      }
      return next(err);
    });
};

const getUser = (req, res, next) => {
  const { userId } = req.params;

  user
    .findById(userId)
    .orFail()
    .then((foundUser) => res.status(OK_STATUS_CODE).send(foundUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "User not found"));
      }
      if (err.name === "CastError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid user ID"));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      createError(BAD_REQUEST_STATUS_CODE, "Email and password are required")
    );
  }

  return user
    .findUserByCredentials(email, password)
    .then((foundUser) => {
      const token = jwt.sign({ _id: foundUser._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(OK_STATUS_CODE).send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return next(
          createError(UNAUTHORIZED_ERROR_STATUS_CODE, "Invalid email or password")
        );
      }

      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  user
    .findById(req.user._id)
    .orFail()
    .then((foundUser) => res.status(OK_STATUS_CODE).send(foundUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "User not found"));
      }
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;

  user
    .findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    )
    .orFail()
    .then((updatedUser) => res.status(OK_STATUS_CODE).send(updatedUser))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "User not found"));
      }
      return next(err);
    });
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  login,
  getCurrentUser,
  updateUser,
};
