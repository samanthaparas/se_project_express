const router = require("express").Router();
const clothingItem = require("./clothingItem");
const userRouter = require("./users");
const NotFoundError = require("../errors/NotFoundError");

router.use("/items", clothingItem);

router.use("/users", userRouter);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
