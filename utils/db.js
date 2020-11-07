const config = require("config");
const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");

const dbConnection = mongoose
  .connect(config.get("db.uri"), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => dbDebugger("Connected to Second Servings MongoDB..."))
  .catch((err) => console.log("Could not connect to MongoDB...", err));

module.exports = { dbConnection };
