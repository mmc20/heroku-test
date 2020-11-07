const _ = require("lodash");
const { ApolloError } = require("apollo-server-express");
const userDebugger = require("debug")("app:user");
const { User, UserTC } = require("../model/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { encrypt, validate } = require("../utils/crypto");

UserTC.addResolver({
  name: "findAll",
  type: [UserTC],
  resolve: async ({ source, args, context }) => {
    const users = await User.find().sort("name");
    userDebugger(users);
    return users;
  },
});

UserTC.addResolver({
  name: "findUserByEmail",
  type: UserTC,
  args: { email: "String!" },
  resolve: async ({ source, args, context }) => {
    const user = await User.findOne({ email: args.email });
    userDebugger(user);
    return user;
  },
});

UserTC.addResolver({
  name: "createUser",
  type: UserTC,
  args: { name: "String!", email: "String!", password: "String!" },
  resolve: async ({ args }) => {
    const { name, email, password } = args;
    if (password.length < 4) 
      return new ApolloError("Password must be at least 4 characters.");

    // Check is user already exists
    let user = await User.findOne({ email: email });
    if (user) return new ApolloError(`User with given email already exists.`);

    // Create new User
    user = new User(_.pick(args, ["name", "email", "password"]));
    user.password = await encrypt(user.password);

    return await user.save();
  },
});

UserTC.addResolver({
  name: "loginUser",
  type: "String!",
  args: { email: "String!", password: "String!" },
  resolve: async ({ args }) => {
    const { email, password } = args;

    let user = await User.findOne({ email: email });
    if (!user) return new ApolloError(`User not found.`);

    if (!(await validate(password, user.password))) {
      return new ApolloError(`Invalid password.`);
    }
    return user.generateAuthToken();
  },
});

UserTC.addResolver({
  name: "deleteUser",
  type: UserTC,
  args: { _id: "ID!" },
  resolve: async ({ args }) => {
    const { _id } = args;
    return await User.findOneAndRemove({ _id: _id });
  },
});

UserTC.addResolver({
  name: "editPassword",
  type: UserTC,
  args: {
    oldPassword: "String!",
    newPassword: "String!",
  },
  resolve: async ({ source, args, context }) => {
    let { oldPassword, newPassword } = args;
    let user = await User.findOne({ _id: context.req.user._id });
    // Check if the user entered the correct password.
    if (!(await validate(oldPassword, user.password))) {
      return new ApolloError(`Incorrect current password.`);
    } else if (oldPassword === newPassword) {
      return user; // Nothing needs to be done.
    } else if (newPassword.length < 4) {
      return new ApolloError("Password must be at least 4 characters.");
    }
    // Update to the new password
    user.password = await encrypt(newPassword);
    return await user.save();
  },
});

const UserQueries = {
  findAll: UserTC.getResolver("findAll"),
  findUserByEmail: UserTC.getResolver("findUserByEmail"),
};

const UserMutations = {
  createUser: UserTC.getResolver("createUser"),
  editPassword: UserTC.getResolver("editPassword"),
  loginUser: UserTC.getResolver("loginUser"),
  deleteUser: UserTC.getResolver("deleteUser", [auth, admin]),
};

exports.UserQueries = UserQueries;
exports.UserMutations = UserMutations;
