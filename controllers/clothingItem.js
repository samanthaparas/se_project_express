const clothingItem = require("../models/clothingItem");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
  FORBIDDEN_ERROR_STATUS_CODE,
} = require("../utils/errors");

const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const createItem = (req, res, next) => {
  const { name, imageUrl, weather } = req.body;
  const ownerId = req.user._id;

  clothingItem
    .create({
      name,
      imageUrl,
      weather,
      owner: ownerId,
    })
    .then((item) => {
      res.status(CREATED_STATUS_CODE).send(item);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid data"));
      }
      return next(err);
    });
};

const getItems = (req, res, next) => {
  clothingItem
    .find({})
    .then((items) => {
      res.status(OK_STATUS_CODE).send(items);
    })
    .catch(next);
};

const deleteItem = (req, res, next) => {
  const { id } = req.params;

  clothingItem
    .findById(id)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return next(createError(FORBIDDEN_ERROR_STATUS_CODE, "Forbidden"));
      }

      return clothingItem
        .findByIdAndDelete(id)
        .then((deletedItem) => res.status(OK_STATUS_CODE).send(deletedItem));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "Item not found"));
      }
      if (err.name === "CastError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid item ID"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  clothingItem
    .findByIdAndUpdate(id, { $addToSet: { likes: userId } }, { new: true })
    .orFail()
    .then((item) => res.status(OK_STATUS_CODE).send(item))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "Item not found"));
      }
      if (err.name === "CastError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid item ID"));
      }
      return next(err);
    });
};

const dislikeItem = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  clothingItem
    .findByIdAndUpdate(id, { $pull: { likes: userId } }, { new: true })
    .orFail()
    .then((item) => res.status(OK_STATUS_CODE).send(item))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(createError(NOT_FOUND_STATUS_CODE, "Item not found"));
      }
      if (err.name === "CastError") {
        return next(createError(BAD_REQUEST_STATUS_CODE, "Invalid item ID"));
      }
      return next(err);
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
