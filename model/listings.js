const config = require("config");
const { composeWithMongoose } = require("graphql-compose-mongoose");
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:user");

const listingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    unique: true,
  },
  units: {
    type: String,
    required: false,
    minlength: 1,
    maxlength: 25,
  },
  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
    minlength: 1,
    maxlength: 1024,
  },
});

const Listing = mongoose.model("Listing", listingSchema);
const ListingTC = composeWithMongoose(Listing);


module.exports = { Listing, ListingTC };