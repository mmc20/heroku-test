const _ = require("lodash");
const express = require("express");
const bcrypt = require("bcrypt");

const { User, validateUser } = require("../model/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().sort("name");
  res.send(users);
});

router.post("/", async (req, res) => {
  // Validate user
  const result = validateUser(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  // Add new user object
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

router.delete("/:id", [auth, admin], (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.send("Successful delete."))
    .catch((err) => {
      return res.status(404).send("The user with given ID does not exist");
    });
});

module.exports = router;
