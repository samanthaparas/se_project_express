const clothingItem = require("../models/clothingItem");
const BadRequestError = require("../utils/BadRequestError");
const NotFoundError = require("../utils/NotFoundError");
const ForbiddenError = require("../utils/ForbiddenError");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
} = require("../utils/errors");

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
        return next(new BadRequestError("Invalid data"));
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
        return next(new ForbiddenError("Forbidden"));
      }

      return clothingItem
        .findByIdAndDelete(id)
        .then((deletedItem) => res.status(OK_STATUS_CODE).send(deletedItem));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
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
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
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
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
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
