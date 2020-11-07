const debug = require("debug")("app:mw:admin");
const { ApolloError } = require("apollo-server-express");

module.exports = function admin(resolve, source, args, context, info) {
  debug("Verifying admin status...");

  if (!context.req.user.isAdmin) return new ApolloError("Forbidden.");
  return resolve(source, { ...args }, context, info);
};
