// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Passport
const passport = require("passport");

// Router Initialization
const uploads = express.Router();

// Database handlers

// Helpers

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(403).send({error: "Not authenticated"});
    }
};

// Endpoints
uploads.post("/create", (req, res) => {

});


// Export Router
module.exports = uploads;