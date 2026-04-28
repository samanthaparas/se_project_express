const router = require("express").Router();
const { getCurrentUser } = require("../controllers/users");

const { getUsers, createUser, getUser } = require("../controllers/users");

router.get("/me", getCurrentUser);

module.exports = router;
