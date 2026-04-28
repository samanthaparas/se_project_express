const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");

// Create
router.post("/", auth, createItem);

// Read
router.get("/", getItems);

// Delete
router.delete("/:id", auth, deleteItem);

// Likes
router.put("/:id/likes", auth, likeItem);
router.delete("/:id/likes", auth, dislikeItem);

module.exports = router;
