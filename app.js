const { errors } = require("celebrate");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const {
  validateCreateUser,
  validateLogin,
} = require("./middlewares/validation");
const errorHandler = require("./middlewares/error-handler");
const routes = require("./routes");
const { login, createUser } = require("./controllers/users");
require("dotenv").config();

const app = express();
const { PORT = 3001 } = process.env;

mongoose.connect("mongodb://localhost:27017/wtwr_db").catch(console.error);

app.use(express.json());
app.use(cors());

app.use(requestLogger);

app.post("/signin", validateLogin, login);
app.post("/signup", validateCreateUser, createUser);

app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
