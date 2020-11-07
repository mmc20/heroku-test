const config = require("config");
const { composeWithMongoose } = require("graphql-compose-mongoose");
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:user");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  debug(this);
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      isAdmin: this.isAdmin,
    },
    config.get("jwtKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);
const UserTC = composeWithMongoose(User);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required().min(2).max(255).required(),
    password: Joi.string().required().min(5).max(1024).required(),
  });

  return schema.validate(user);
}

function validateAuth(req) {
  const authSchema = Joi.object({
    email: Joi.string().email().required().min(5).max(255).required(),
    password: Joi.string().required().min(5).max(255).required(),
  });

  return authSchema.validate(req);
}

module.exports = { User, UserTC, validateUser, validateAuth };
