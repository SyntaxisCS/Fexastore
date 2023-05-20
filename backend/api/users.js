// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Passport
const passport = require("passport");

// Router initialization
const users = express.Router();

// Multer
const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
        files: 1
    }
});

// Database handlers
const {getUserByUUID, getUserByEmail, getAllUsers, createUser, authenticate, isVerified, getUserByUsername, checkVerificationToken, verifyEmail, changeUserEmail, emailChangeTokenFirstEmailConsent, checkEmailChangeToken, changeUserFirstName, changeUserLastName, isUsernameUnique, changeUserUsername, changeUserNameVisibility} = require("./database/dbHandler");

// Helpers
const {generateUUID, generateToken} = require("../Utils/Helpers/keyHandler");
const { sendAccountCreationNotification, sendEmailVerificationLink, sendInitialEmailChange, sendNewEmailChangeVerification, sendEmailChangeNotification } = require("./email/emailHandler");
const { handleAvatarUpload } = require("./cloudStorage/storageHandler");

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(400).send({error: "Not authenticated"});
    }
};

const emailLimiter = rateLimit({
    windowMs: 60*60*1000,
    max: 15,
    message: "",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

// Rate limiters
const passwordChangeLimiter = rateLimit({
    windowMs: 1000*60*60*24,
    max: 15,
    message: "You jut changed your password, please try again later",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 1000*60*60*24,
    max: 15,
    message: "You just make a forgot password request, please check your email or try again later",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

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
            username: user.username,
            userType: user.user_type
        };

        req.session.user = userSess;

        console.info(`User ${user.uuid} logged in on ${new Date()}`);
        // Send user back
        res.status(200).send(userSess);
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
    }
});

// Get all users
users.get("/", ensureAuthentication, (req, res) => {
    // Check user type
    if (req.session.user.userType === "admin") {

        // get users
        getAllUsers().then(users => {
            res.send(users);
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
users.get("/id/:uuid", ensureAuthentication, (req, res) => {
    let uuid = req.params.uuid;

    // Ensure user is admin or same user
    if (req.session.user.userType === "admin" || req.session.user.uuid === uuid) {
        getUserByUUID(uuid).then(user => {
            res.send(user);
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not retrieve user"});
        });
    } else { // return "public profile" if different user

        getUserByUUID(uuid).then(user => {
            let publicUser = {
                uuid: user.uuid,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                isVerified: user.email_verified,
                dateJoined: user.date_joined,
                numberOfUploads: user.number_of_uploads,
                numberOfDownloads: user.number_of_downloads,
                planType: user.plan_type,
                avatar_url: user.avatar_url
            };

            if (user.name_visibility === false) {
                publicUser.firstName === null;
                publicUser.lastName === null;
            }

            res.send(publicUser);

        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not retrieve user"});
        });
    }
});

// Get user by username
users.get("/username/:username", (req, res) => {
    let username = req.params.username;

    getUserByUsername(username).then(user => {

        if (req.session.user.uuid === user.uuid) {
            res.send(user);
        } else {
            let publicUser = {
                uuid: user.uuid,
                username: user.username,
                firstName: null,
                lastName: null,
                isVerified: user.email_verified,
                dateJoined: user.date_joined,
                numberOfUploads: user.number_of_uploads,
                numberOfDownloads: user.number_of_downloads,
                planType: user.plan_type,
                avatar_url: user.avatar_url
            };

            res.send(publicUser);
        }

    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not retrieve user"});
    });
});

// Get user avatar
users.get("/avatar/:uuid", (req, res) => {
    let uuid = req.params.uuid;

    getUserByUUID(uuid).then(user => {
        if (user.avatar_url) {
            res.send(user.avatar_url);
        } else {
            res.status(204).send("null");
        }
    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not get avatar"});
    });
});

// Create Account
users.post("/create", upload.single("avatar"), (req, res) => {
    let user = req.body;
    let avatar = req.file;

    const userId = generateUUID(user.email);

    // upload avatar to s3
    handleAvatarUpload(userId, avatar).then(url => {

        let userObject = {
            uuid: userId,
            email: user.email,
            firstName: user.firstName ? user.firstName : null,
            lastName: user.lastName ? user.lastName : null,
            username: user.username,
            password: user.password,
            avatarUrl: url,
        };
    
        // Database
        createUser(userObject).then(success => {
            // redact password
            userObject.password = "server redacted";

            console.info(success);

            // Send email verification email
            sendAccountCreationNotification(userObject.email, {username: userObject.username, firstName: userObject.first_name, lastName: userObject.last_name}).then(response => {
                sendEmailVerificationLink(userObject.email, {username: userObject.username, firstName: userObject.first_name, lastName: userObject.last_name}).then(response => {
                    console.info(response);
                    res.status(200).send(userObject);
                }, err => {
                    console.error(err);
                    res.status(200).send(success + " could not send verification email");
                });
            }, err => {
                console.error(err);
                res.status(200).send(success + " could not send welcome email");
            });
        }, err => {
            console.error(err);
            if (err === "User already exists") {
                res.status(409).send({error: "User already exists"});
            } else {
                res.status(500).send({error: "Could not add user"});
            }
        });

    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not upload avatar"});
    });
});

// Delete Account -- Delete all uploaded files associated with user (groups as well if only user in group)
users.delete("/delete", ensureAuthentication, (req, res) => {
    // rethink this
});

// Change Password
users.put("/change/password", ensureAuthentication, (req, res) => {
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

// Create Email request (does not actually change email)
users.put("/change/email", ensureAuthentication, (req, res) => {
    let newEmail = req.body.email;

    // check if email is verified first
    isVerified(req.session.user.email).then(verified => {

        if (verified.verified) {

            // send email
            sendInitialEmailChange(req.session.user.email, newEmail).then(success => {
                res.status(200).send(success);
            }, err => {
                console.error(err);
                res.status(500).send({error: err});
            });
        } else {
            res.status(403).send({error: "You must have a verified email to request an email change"});
        }
    }, err => {
        res.status(400).send({error: err});
    });
});

// First Email Consent
users.post("/change/email/consent", (req, res) => {
    const token = req.query.token;

    if (token) {
        checkEmailChangeToken(token).then(dbToken => {
            emailChangeTokenFirstEmailConsent(token).then(success => {
                sendNewEmailChangeVerification(dbToken.old_email, dbToken.new_email).then(success => {
                    res.status(200).send(success);
                }, err => {
                    res.status(500).send({error: err});
                })
            }, err => {
                console.error(err);
                res.status(500).send({error: "We ran into an error: Could not validate the consent of email one"});
            })
        }, err => {
            if (err.includes("Token expired")) {
                res.status(400).send({error: "Token has expired. Please make a new request."});
            } else if (err === "Token does not exist") {
                res.status(404).send({error: err});
            } else {
                res.status(500).send({error: "Server Error"});
            }
        });
    } else {
        res.end();
    }
});

// Change Email (both emails consent, actually make change here)
users.post("/change/email/final", (req, res) => {
    const token = req.query.token;

    if (token) {
        checkEmailChangeToken(token).then(dbToken => {

            changeUserEmail(dbToken.old_email, dbToken.new_email).then(success => {
                sendEmailChangeNotification(dbToken.old_email, dbToken.new_email).then(success => {
                    res.status(201).send(`Email changed from ${dbToken.old_email} to ${dbToken.new_email}`);
                }, err => {
                    res.status(500).send({error: err});
                });
            }, err => {
                if (err === "Emails cannot match") {
                    res.status(400).send({error: err});
                } else if (err.includes("Could not verify email")) {
                    res.status(500).send({error: "Could not verify email"});
                } else {
                    res.status(500).send({error: err});
                }
            });

        }, err => {
            if (err.includes("Token expired")) {
                res.status(400).send({error: "Token has expired. Please make a new request."});
            } else if (err === "Token does not exist") {
                res.status(404).send({error: err});
            } else {
                res.status(500).send({error: "Server Error"});
            }
        });
    } else {
        res.end();
    }
});

users.post("/verifyemail", emailLimiter, (req, res) => {
    if (req.body.token) {
        checkVerificationToken(req.body.token).then(good => {
            // get user with id found with token
            getUserByUUID(good.user_id).then(user => {
                // verifyEmail
                verifyEmail(user.email).then(response => {
                    res.status(201).send(`Email verify on ${new Date()}`);
                }, err => {
                    if (err.includes("has already verified the email")) {
                        res.status(400).send({error: "You have already verified your email!"});
                    } else if (err === "User does not exist") {
                        res.status(400).send({error: err});
                    } else {
                        res.status(500).send({error: "Server Error"});
                    }
                });
            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not verify email"});
            });
        }, err => {
            if (err === "Token has expired") {
                res.status(400).send({error: "Token has expired"});
            } else if (err === "Token does not exist") {
                res.status(400).send({error: "Token does not exist"});
            } else {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            }
        });
    }
});

users.put("/change/firstname", ensureAuthentication, (req, res) => {
    if (req.body.firstName === "") {
        req.body.firstName = null;
    }

    changeUserFirstName(req.session.user.email, req.body.firstName).then(success => {
        res.status(201).send(`First name for user with email ${req.session.user.email} changed to ${req.body.firstName} on ${new Date()}`);
    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not change first name"});
    });
});

users.put("/change/lastname", ensureAuthentication, (req, res) => {
    if (req.body.lastName === "") {
        req.body.lastName = null;
    }
    
    changeUserLastName(req.session.user.email, req.body.lastName).then(success => {
        res.status(201).send(`Last name for user with email ${req.session.user.email} changed to ${req.body.lastName} on ${new Date()}`);
    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not change last name"});
    });
});

users.put("/change/username", ensureAuthentication, (req, res) => {
    if (!req.body.username) {
        res.status(400).send({error: "Missing fields"});
    }

    isUsernameUnique(req.body.username).then(success => {
        changeUserUsername(req.session.user.email, req.body.username).then(success => {
            res.status(201).send(`Username changed to ${req.body.username} on ${new Date()}`);
        }, err => {
            console.error(err);
            res.status(500).send({error: "Server Error"});
        });
    }, err => {
        if (err === "A user already exists with that username") {
            res.status(400).send({error: "That username is already taken"});
        } else {
            res.status(500).send({error: "Server Error"});
        }
    });
});

users.put("/change/namevisibility", ensureAuthentication, (req, res) => {
    if (!req.body.newVis) {
        res.status(400).send({error: "Missing fields"});
    }

    changeUserNameVisibility(req.session.user.email, req.body.newVis).then(success => {
        res.status(200).send(success);
    }, err => {
        if (err === "User does not exist") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: err});
        }
    });
});

// Export router
module.exports = users;