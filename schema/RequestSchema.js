const _ = require("lodash");
const { ApolloError } = require("apollo-server-express");
const requestDebugger = require("debug")("app:request");
const { User, UserTC } = require("../model/user");
const { Request, UnionRequestTC, FoodRequestTC, FoodRequest, RequestDTC, JoinRequestTC } = require("../model/request");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { encrypt, validate } = require("../utils/crypto");
const {STATUS_ENUM} = require("../utils/status_enum");

FoodRequestTC.addResolver({
    name: "getFoodRequestByUser",
    type: [FoodRequestTC],
    args: {id: "ID", email: "String"},
    resolve: async ({args, context}) => {
        let {id, email} = args
        let userIds = [id];
        // Lookup users if specific ID not provided.
        if (!id) { 
            const userQuery = {
                email: {$regex: `.*${email || ""}.*`}
            };
            requestDebugger(userQuery);
            userIds = (await User.find(userQuery, {_id: 1}).exec()).map(doc => doc._id);
        }
        return Request.find({organizationId: {$in: userIds}}).exec();
    },
});

FoodRequestTC.addResolver({
    name: "createFoodRequest",
    type: FoodRequestTC,
    args: {listingId: "ID!", note: "String"},
    resolve: async ({ args, context }) => {
        const { listingId, note } = args;
        // Create new request
        request = new FoodRequest({
            status: STATUS_ENUM.PENDING,
            sentAt: Date.now(),
            organizationId: context.req.user._id,
            note,
            listingId,
        });
        return await request.save();
    },
});

FoodRequestTC.addResolver({
    name: "deleteFoodRequest",
    type: FoodRequestTC,
    args: {id: "ID!"},
    resolve: async ({ args, context }) => {
        // TODO: Add protection? Lol.
        return FoodRequest.findByIdAndDelete(args.id);
    },
});

const updateStatusHelper = (statusVal) => (async ({ args, context }) => {
    const { requestId } = args;
    return Request.findByIdAndUpdate(requestId, {status: statusVal}, {new: true})
});

RequestDTC.addResolver({
    name: "acceptRequest",
    type: UnionRequestTC,
    args: {requestId: "ID!"},
    resolve: updateStatusHelper(STATUS_ENUM.ACCEPTED),
});

RequestDTC.addResolver({
    name: "rejectRequest",
    type: UnionRequestTC,
    args: {requestId: "ID!"},
    resolve: updateStatusHelper(STATUS_ENUM.REJECTED),
});

RequestDTC.addResolver({
    name: "completeRequest",
    type: UnionRequestTC,
    args: {requestId: "ID!"},
    resolve: updateStatusHelper(STATUS_ENUM.COMPLETE),
});

RequestDTC.addResolver({
    name: "cancelRequest",
    type: UnionRequestTC,
    args: {requestId: "ID!"},
    resolve: updateStatusHelper(STATUS_ENUM.CANCELLED),
});

const RequestQueries = {
    getFoodRequests: FoodRequestTC.getResolver("findMany"),
    // TODO: Make this general & integrate organization
    getFoodRequestByUser: FoodRequestTC.getResolver("getFoodRequestByUser")
};

const RequestMutations = {
    createFoodRequest: FoodRequestTC.getResolver("createFoodRequest", [auth]),
    deleteFoodRequest: FoodRequestTC.getResolver("deleteFoodRequest"),
    acceptRequest: RequestDTC.getResolver("acceptRequest"),
    rejectRequest: RequestDTC.getResolver("rejectRequest"),
    completeRequest: RequestDTC.getResolver("completeRequest"),
    cancelRequest: RequestDTC.getResolver("cancelRequest"),
};

exports.RequestQueries = RequestQueries;
exports.RequestMutations = RequestMutations;
