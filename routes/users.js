const router = require("express").Router();
const auth = require("../middlewares/auth");
const { validateUpdateUser } = require("../middlewares/validation");

const { getCurrentUser, updateUser } = require("../controllers/users");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUser, updateUser);

module.exports = router;
