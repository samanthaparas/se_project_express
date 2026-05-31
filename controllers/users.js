const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const user = require("../models/user");
const BadRequestError = require("../errors/BadRequestError");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
} = require("../utils/errors");

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
    return next(new BadRequestError("Invalid data"));
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
        return next(new ConflictError("A user with this email already exists."));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data"));
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
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID"));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
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
        return next(new UnauthorizedError("Invalid email or password"));
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
        return next(new NotFoundError("User not found"));
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
        return next(new BadRequestError("Invalid data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
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
