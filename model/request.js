const config = require("config");
const mongoose = require("mongoose");
const { composeWithMongooseDiscriminators } = require('graphql-compose-mongoose');
const { STATUS_ENUM } = require("../utils/status_enum");
const debug = require("debug")("app:request");
const { ListingTC } = require("./listings");
const { UserTC } = require("./user");
const { sc } = require("graphql-compose");

const DKey = 'type'; // Discriminator key
const REQUEST_TYPE_ENUM = {
  FOOD: 'FoodRequest',
  JOIN: 'JoinRequest',
};

// Define Interface Schema
const RequestSchema = new mongoose.Schema({
    type: {
      type: String,
      require: true,
      enum: (Object.keys(REQUEST_TYPE_ENUM)),
      description: 'Request type',
    },
    status: {
        type: String,
        required: true,
        enum: Object.keys(STATUS_ENUM),
    },
    sentAt: {
        type: Date,
        required: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        minlength: 1,
        maxlength: 1024,
    },
    note: {
        type: String,
        minlength: 1,
        maxlength: 5000
    }
});

// DEFINE DISCRIMINATOR SCHEMAS
const FoodRequestSchema = new mongoose.Schema({
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    // deliveryDate: {
    //     type: Date,
    //     required: true,
    // }
});
const JoinRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});
// Set discriminator Key
RequestSchema.set('discriminatorKey', DKey);

// Create base model
const Request = mongoose.model('Request', RequestSchema);

// create mongoose discriminator models
const FoodRequest = Request.discriminator(REQUEST_TYPE_ENUM.FOOD, FoodRequestSchema);
const JoinRequest = Request.discriminator(REQUEST_TYPE_ENUM.JOIN, JoinRequestSchema);

// Create mongoose type composers
const RequestDTC = composeWithMongooseDiscriminators(Request, {
    fields: { remove: ["organizationId"] },
});
RequestDTC.addRelation('organization', {
    resolver: () => UserTC.getResolver('findById'),
    prepareArgs: {_id: (source) => source.organizationId,},
    projection: { organizationId: 1 },
});

// Create concrete implementation type composers.
const FoodRequestTC = RequestDTC.discriminator(FoodRequest, {
    fields: { remove: ["listingId"] },
});
FoodRequestTC.addRelation('listing', {
    resolver: () => ListingTC.getResolver('findById'),
    prepareArgs: {_id: (source) => source.listingId,},
    projection: { listingId: 1 },
});
const JoinRequestTC = RequestDTC.discriminator(JoinRequest);

const UnionRequestTC = sc.createUnionTC({
    name: 'UnionRequest',
    types: [ RequestDTC, FoodRequestTC, JoinRequestTC ],
    resolveType: (value) => value.type,
  });

module.exports = { 
    Request,
    RequestDTC,
    FoodRequest,
    FoodRequestTC,
    JoinRequest,
    JoinRequestTC,
    UnionRequestTC,
};

// requestSchema.methods.generateAuthToken = function () {
//     debug(this);
//     const token = jwt.sign(
//         {
//             _id: this._id,
//             status: this.status,
//             sentAt: this.sentAt,
//             organization: this.organization,
//             note: this.note
//         },
//         config.get("jwtKey")
//     );
//     return token;
// };
