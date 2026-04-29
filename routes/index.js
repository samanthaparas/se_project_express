const router = require("express").Router();
const clothingItem = require("./clothingItem");
const userRouter = require("./users");
const { NOT_FOUND_STATUS_CODE } = require("../utils/errors");

router.use("/items", clothingItem);

router.use("/users", userRouter);

router.use((req, res) => {
  res
    .status(NOT_FOUND_STATUS_CODE)
    .send({ message: "Requested resource not found" });
});

module.exports = router;
