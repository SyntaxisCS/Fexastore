// Packages
const {Client} = require("pg");
const bcrypt = require("bcrypt");
const validator = require("validator");
const fs = require("fs");
const JSZip = require("jszip");
const moment = require("moment");

// Helper functions
const aes256 = require("aes256");
const {generateNanoID} = require("../../Utils/keyHandler");

// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../../.env")});

// Database setup
const DB = new Client({
    host: process.env.pgHost,
    port: process.env.pgPort,
    user: process.env.pgUser,
    password: process.env.pgPassword,
    database: process.env.pgDB,
    log: console.log
});

DB.connect();

// USERS -----------------------------------------------------

const getUserByUUID = async (uuid) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUserByUUID",
            text: "SELECT * FROM users WHERE uuid = $1",
            values: [uuid]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject({
                    status: 404,
                    message: "No users found by that uuid"
                });
            }
        }, err => {
            reject({
                status: 500,
                message: "Failed to get user by uuid",
                details: err.message
            });
        });
    });
};

const getUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUserByEmail",
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject({
                    status: 404,
                    message: "No users found with that email"
                });
            }
        }, err => {
            reject({
                status: 500,
                message: "Failed to get user by email",
                details: err.message
            });
        });
    });
};

const getAllUsers = async () => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getAllUsers",
            text: "SELECT * FROM users",
            values: []
        };

        DB.query(query).then(response => {
            if (response.rows) {
                resolve(response.rows);
            } else {
                reject({
                    status: 404,
                    message: "No users found"
                });
            }
        }, err => {
            reject({
                status: 500,
                message: "Failed to get all users",
                details: err.message
            });
        });
    });
};

const createUser = async (newUser) => {
    return new Promise((resolve, reject) => {

    });
};

const deleteUser = async (email) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteUser",
            text: "DELETE FROM users WHERE email = $1",
            values: [email]
        };
        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const changeUserFirstName = async (email, newFirstName) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "changeUserFirstName",
            text: "UPDATE users SET first_name = $1 WHERE email = $2",
            values: [newFirstName, email]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const changeUserLastName = async (email, newLastName) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "changeUserLastName",
            text: "UPDATE users SET last_name = $1 WHERE email = $2",
            values: [newLastName, email]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const changeUserUsername = async (email, newUsername) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "changeUserUsername",
            text: "UPDATE users SET username = $1 WHERE email = $2",
            values: [newUsername, email]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Change email
const changeUserEmail = async (email, newEmail) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            
            if (user.email === newEmail) {
                reject("Emails cannot match");
            } else {
                // Additional fields
                let numberOfEmailChanges = user.number_of_email_change + 1;
                let emailChangeDate = new Date();


                let query = {
                    name: "changeUserEmail",
                    text: "UPDATE users SET email = $1,number_of_email_change = $2,last_email_change = $3 WHERE email = $4",
                    values: [newEmail, numberOfEmailChanges, emailChangeDate, email]
                };

                DB.query(query).then(response => {
                    resolve(response);
                }, err => {
                    console.error(err);
                    reject("COuld not change email");
                });

            }
        
        }, err => {
            console.error(err);
            reject("Could not verify email: getUserByEmail");
        });
    });
};

// Verify Email
const verifyEmail = async (email) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            
            // Email not verified
            if (!user.email_verified) {
                // create timestamp
                let verifiedDate = new Date();

                let query = {
                    name: "verifyEmail",
                    text: "UPDATE users SET email_verified = $1,email_verified_date = $2 WHERE email = $3",
                    values: [true, verifiedDate, email]
                };

                DB.query(query).then(response => {
                    resolve(`${user.uuid} has verified the email ${email}`);
                }, err => {
                    console.error(err);
                    reject("Could not verifiy email");
                });
            } else {
                // email already verified
                reject(`${user.uuid} has already verified the email ${email} on ${user.email_verified_date ? user.email_verified_date : "an unknown date and time"}`);
            }
        });
    });
};

module.exports = {
    // Users
    getUserByUUID,
    getUserByEmail,
    getAllUsers,
};