const {
  validateCreateUser,
  validateLogin,
} = require("./middlewares/validation");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/error-handler");
const routes = require("./routes");
const { login, createUser } = require("./controllers/users");

const app = express();
const { PORT = 3001 } = process.env;

mongoose.connect("mongodb://localhost:27017/wtwr_db").catch(console.error);

app.use(express.json());
app.use(cors());

app.post("/signin", validateLogin, login);
app.post("/signup", validateCreateUser, createUser);

app.use(routes);
app.use(errorHandler);

app.listen(PORT);
