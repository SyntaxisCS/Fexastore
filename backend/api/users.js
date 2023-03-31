// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Passport
const passport = require("passport");

// Router initialization
const users = express.Router();

// Database handlers
const {getUserByUUID, getUserByEmail, getAllUsers, authenticate, isVerified} = require("./database/dbHandler");

// Helpers
const {generateUUID, generateToken} = require("../Utils/keyHandler");

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(400).send({error: "Not authenticated"});
    }
};

// Rate limiters

// forgot password

// email limiter

// account data limiter

// Endpoints
users.get("/authenticate", (req, res) => {
    if (req.session) {
        res.status(200).send(req.session.user);
    } else {
        res.status(403).send({error: "Not authenticated"});
    }
});

// Login
users.post("/login", passport.authenticate("local", {failureMessage: {error: "Could not authenticate"}}), (req, res) => {
    // Get user
    getUserByEmail(req.body.email).then(user => {
        // Set authenticated status
        req.session.authenticated = true;

        // Add user information to session
        let userSess = {
            uuid: user.uuid,
            email: user.email,
            userType: user.user_type
        };

        req.session.user = userSess;

        // Send user back
        res.status(200).send(`User ${user.uuid} logged in on ${new Date()}`);
    }, err => {
        console.error(err);
        if (err.status === 404) {
            res.status(err.status).send({error: err.message});
        } else {
            res.status(err.status).send({error: err.message});
        }
    });
});

// Logout
users.delete("/logout", ensureAuthentication, (req, res) => {
    if (req.session) {
        // passport logout
        req.logout((err) => {
            if (err) {
                console.error(err);
            }
        });

        // destroy session
        req.session.destroy(err => {
            if (err) {
                console.error(err);
                res.status(400).send("Unable to log out");
            }
        });
    }
});

// Get all users
users.get("/", ensureAuthentication, (req, res) => {
    // Check user tyoe
    if (req.session.user.userType === "admin") {

        // get users
        getAllUsers().then(users => {
            res.send({users: users});
        }, err => {
            if (err === "No users found") {
                res.status(204).send({error: err});
            } else {
                res.status(500).send({error: "Could not complete request"});
            }
        });

    } else {
        res.status(403).send({error: "You are not permitted to view this page"});
    }
});

// Get user by uuid
users.get("/:uuid", ensureAuthentication, (req, res) => {
    let uuid = req.params.uuid;

    // Ensure user is admin or same user
    if (req.session.user.userType === "admin" || req.session.user.uuid === uuid) {
        getUserByUUID(uuid).then(user => {
            res.send({user: user});
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not retrieve user"});
        });
    } else {
        res.status(403).send({error: "You are not permitted to view this page"});
    }
});

// Create Account
users.post("/create", (req, res) => {
    let date = new Date();

    let user = req.body;

    let userObject = {
        uuid: generateUUID(user.email),
    };

    // Database
    createUser(userObject).then(success => {
        // redact password
        userObject.password = "server redacted";

        // Send email verification email
            // Send account creation notification email
    }, err => {
        console.error(err);
        if (err === "User already exists") {
            res.status(409).send({error: "User already exists"});
        } else {
            res.status(500).send({error: "Could not add user"});
        }
    });
});

// Delete Account -- Delete all uploaded files associated with user (groups as well if only user in group)
users.delete("/delete", ensureAuthentication, (req, res) => {
    // rethink this
});

// Change Password
users.post("/changepassword", ensureAuthentication, (req, res) => {
    // Check old password
    authenticate(req.session.user.email, req.body.oldPassword).then(authenticated => {

        // check if user is verified
        isVerified(req.session.user.email).then(result => {
            
            if (result.verified) {

                // Change password if user is verified
                changeUserPassword(req.session.user.email, req.body.newPassword).then(response => {
                    
                    // Send email

                }, err => {
                    if (err === "Passwords cannot match") {
                        res.status(400).send({error: "Your password cannot be the same"});
                    } else {
                        console.error(err);
                        res.status(500).send({error: "Could not change password. Please try again later"});
                    }
                });

            } else {
                res.status(403).send({error: "You must have a verified email to change your password"});
            }

        }, err => {
            res.status(403).send({error: "Unable to check email verification status"});
        });
    }, err => {
        res.status(403).send({error: "Old password not correct"});
    });
});

// Export router
module.exports = users;