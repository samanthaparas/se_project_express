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
  INTERNAL_SERVER_ERROR_STATUS_CODE,
  UNAUTHORIZED_ERROR_STATUS_CODE,
} = require("../utils/errors");

const getUsers = (req, res) => {
  user
    .find({})
    .then((users) => {
      res.status(OK_STATUS_CODE).send(users);
    })
    .catch(() =>
      res
        .status(INTERNAL_SERVER_ERROR_STATUS_CODE)
        .send({ message: "An error has occurred on the server." })
    );
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!password) {
    res.status(BAD_REQUEST_STATUS_CODE).send({ message: "Invalid data" });
    return;
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => user.create({ name, avatar, email, password: hash }))
    .then((createdUser) => {
      const userObject = createdUser.toObject();
      delete userObject.password;
      res.status(CREATED_STATUS_CODE).send(userObject);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res
          .status(CONFLICT_ERROR_STATUS_CODE)
          .send({ message: "A user with this email already exists." });
      }
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST_STATUS_CODE)
          .send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR_STATUS_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  user
    .findById(userId)
    .orFail()
    .then((foundUser) => res.status(OK_STATUS_CODE).send(foundUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_STATUS_CODE)
          .send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_STATUS_CODE)
          .send({ message: "Invalid user ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR_STATUS_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  user
    .findUserByCredentials(email, password)
    .then((foundUser) => {
      const token = jwt.sign({ _id: foundUser._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(OK_STATUS_CODE).send({ token });
    })
    .catch(() => {
      res
        .status(UNAUTHORIZED_ERROR_STATUS_CODE)
        .send({ message: "Invalid email or password" });
    });
};

const getCurrentUser = (req, res) => {
  user
    .findById(req.user._id)
    .orFail()
    .then((foundUser) => res.status(OK_STATUS_CODE).send(foundUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_STATUS_CODE)
          .send({ message: "User not found" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR_STATUS_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const updateUser = (req, res) => {
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
        return res
          .status(BAD_REQUEST_STATUS_CODE)
          .send({ message: "Invalid data" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_STATUS_CODE)
          .send({ message: "User not found" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR_STATUS_CODE)
        .send({ message: "An error has occurred on the server." });
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
