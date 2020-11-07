const _ = require("lodash");
const { ApolloError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const listingsDebugger = require("debug")("app:listings");
const { Listing, ListingTC } = require("../model/listings");
const user = require("../model/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

ListingTC.addResolver({
  name: "getAllListings",
  type: [ListingTC],
  resolve: async ({ source, args, context }) => {
    const listings = await Listing.find().sort("name");
    listingsDebugger(listings);
    return listings;
  },
});

ListingTC.addResolver({
  name: "createListing",
  type: ListingTC,
  args: {
    name: "String!",
    units: "String", 
    quantity: "Int!",
    description: "String"
  },
  resolve: async ({ args }) => {
    const { name, units, quantity, description } = args;

    // Check is listing already exists, should just increment quantity
    let listing = await Listing.findOne({ name: name });
    if (listing) return new ApolloError(`Listing already exists.`);

    // Create new Listing
    listing = new Listing(_.pick(args, ["name", "units", "quantity", "description"]));
    await listing.save();

    return listing;
  },
});

ListingTC.addResolver({
  name: "editListing",
  type: ListingTC,
  args: {
    _id: "ID!",
    name: "String!",
    units: "String",
    quantity: "Int!",
    description: "String",
  },
  resolve: async ({ source, args, context }) => {
    let { _id, name, units, quantity, description } = args;
    
    let listing = await Listing.findOne({ _id: _id });

    listing.name = name
    listing.units = units
    listing.quantity = quantity
    listing.description = description
    
    return await listing.save();
  },
});

ListingTC.addResolver({
  name: "deleteListing",
  type: ListingTC,
  args: { _id: "ID!" },
  resolve: async ({ args }) => {
    const { _id } = args;
    return await Listing.findOneAndRemove({ _id: _id });
  },
});

const ListingQueries = {
  getAllListings: ListingTC.getResolver("getAllListings"),
};

const ListingMutations = {
  createListing: ListingTC.getResolver("createListing", [auth, admin]),
  editListing: ListingTC.getResolver("editListing", [auth, admin]),   
  deleteListing: ListingTC.getResolver("deleteListing", [auth, admin]),   
};

exports.ListingQueries = ListingQueries;
exports.ListingMutations = ListingMutations;