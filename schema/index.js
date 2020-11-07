const { sc } = require("graphql-compose");
const { UserQueries, UserMutations } = require("./UserSchema");
const { ListingQueries, ListingMutations } = require("./ListingSchema");
const { RequestQueries, RequestMutations } = require("./RequestSchema");

sc.Query.addFields({
  ...UserQueries,
  ...RequestQueries,
  ...ListingQueries,
});

sc.Mutation.addFields({
  ...UserMutations,
  ...RequestMutations,
  ...ListingMutations,
});

const Schema = sc.buildSchema();

module.exports = { Schema };