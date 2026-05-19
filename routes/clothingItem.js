const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  validateCreateItem,
  validateItemId,
} = require("../middlewares/validation");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");

// Create
router.post("/", auth, validateCreateItem, createItem);

// Read
router.get("/", getItems);

// Delete
router.delete("/:id", auth, validateItemId, deleteItem);

// Likes
router.put("/:id/likes", auth, validateItemId, likeItem);
router.delete("/:id/likes", auth, validateItemId, dislikeItem);

module.exports = router;
