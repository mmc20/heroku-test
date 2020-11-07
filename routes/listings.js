const _ = require("lodash");
const express = require("express");
const bcrypt = require("bcrypt");

const { Listings } = require("../model/listings");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (req, res) => {
    console.log("GET from listings");

});

router.post("/", async (req, res) => {
    // Validate user
    console.log("POST from listings");
    listings = new Listings(_.pick(req.body, ["name", "quantity"]));

    await listings.save();

    const token = user.generateAuthToken();
    res
        .header("x-auth-token", token)
        .send(_.pick(listings, ["_id", "name"]));
});

module.exports = router;