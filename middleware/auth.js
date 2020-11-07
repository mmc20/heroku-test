const config = require("config");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:mw:auth");
const { ApolloError } = require("apollo-server-express");

module.exports = function authorize(resolve, source, args, context, info) {
  debug("Authorizing request...");

  const token = context.req.headers.authorization;
  if (!token) return new ApolloError("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtKey"));
    // Set the req.user field for use by further middlewares
    context.req.user = decoded;
    return resolve(source, { ...args }, context, info);
  } catch (ex) {
    return new ApolloError("Access denied. Invalid token provided.");
  }
};
