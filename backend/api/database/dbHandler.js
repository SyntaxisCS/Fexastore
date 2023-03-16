// Packages
const {Client} = require("pg");
const bcrypt = require("bcrypt");
const validator = require("validator");
const fs = require("fs");
const JSZip = require("jszip");
const moment = require("moment");

// Helper functions
const aes256 = require("aes256");
const {generateNanoID, deriveKey} = require("../../Utils/keyHandler");

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

const isUsernameUnique = async (username) => {
    return new Promise((resolve, reject) => {

        // check if username exists
        let query = {
            name: "checkUsername",
            text: "SELECT * FROM users WHERE username = $1",
            values: [username]
        };

        DB.query(query).then(response => {

            // If rows > 0 then a user exists with that username
            if (response.rows.length > 0) {
                reject("A user already exists with that username");
            } else {
                resolve("User does not exist with that username");
            }

        }, err => {
            reject(`Could not check username uniqueness \n ${err}`);
        });

    });
};

const checkUserExistance = async (email) => {
    return new Promise((resolve, reject) => {

        // check if user exists
        let query = {
            name: "checkUserExistance",
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        };

        DB.query(query).then(response => {

            // If rows > 0 then a user exists with that email
            if (response.rows.length > 0) {
                reject("User already exists with that email");
            } else {
                resolve("User does not exist with that email");
            }

        }, err => {
            reject(`Could not check user existance \n ${err}`);
        });

    });
};

/*
    let newUserObject = {
        uuid: uuid,
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
    }
*/


// username validity checked on signup form (or username change form) assume username is unique and safe
const createUser = async (newUser) => {
    return new Promise((resolve, reject) => {

        // check if user exists
        checkUserExistance(newUser.email).then(doesNotExist => {

            // User does not exist with that email. Create user

            bcrypt.genSalt(10).then(salt => {

                // hash password
                bcrypt.hash(newUser.password, salt).then(hashedPassword => {

                    // Derive key for encryption
                    deriveKey(newUser.uuid, newUser.password, salt).then(derivedKey => {

                        // Encrypt key
                        let encryptedKey = encryptKey(derivedKey);

                        // Add key to database
                        // createKey

                    }, err => {
                        console.error(err);
                    });


                    // Normalize Email
                    let options = {
                        gmail_lowercase: true,
                        gmail_convert_googlemaildotcom: true,
                        outlookdotcom_lowercase: true,
                        yahoo_lowercase: true,
                        icloud_lowercase: true,
                        gmail_remove_subaddress: true,
                        outlookdotcom_remove_subaddress: true,
                        yahoo_remove_subaddress: true,
                        icloud_remove_subaddress: true
                    };
                    const normalizedEmail = validator.normalizeEmail(newUser.email, options);

                    // DB query
                    let query = {
                        name: "createUser",
                        text: "INSERT INTO users () VALUES ()",
                        values: []
                    };

                    DB.query(query).then(response => {

                        if (response.rowCount > 0) {
                            // success
                            resolve(`User ${user.uuid} created at ${new Date()}`);
                        } else {
                            reject(`Could not create user \n ${response}`);
                        }

                    }, err => {
                        reject(err);
                    });


                }, err => {
                    
                    console.error(err);
                    reject("Failed during the hashing process");

                });

            }, err => {

                console.error(err);
                reject("Failed during the salting process");
            
            });


        }, err => {
            
            if (err === "User already exists with that email") {
                reject(err);
            } else {
                console.error(err);
                reject("Encountered Error. Could not create user");
            }

        });

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

// User Modification
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

// Email Verification
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

const isVerified = async (email) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {

            // Check Verification Status
            if (user.email_verified) {
                resolve({
                    verified: true,
                    verifiedDate: user.email_verified_date
                });
            } else {
                resolve({
                    verified: false,
                    verifiedDate: null
                });
            }

        }, err => {
            console.error(err);
            reject("User does not exist");
        });
    });
};

// Authenticate
const authenticate = async (email, password) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            bcrypt.compare(password, user.password).then(result => {
                if (result) {
                    resolve("Authenticated");
                } else {
                    reject("Incorrect password");
                }
            }, err => {
                reject(err);
            });
        }, err => {
            reject(`Incorrect email \n ${err}`);
        });
    });
};

// Privacy
const downloadAccountData = async (userId) => {
    // unsure what to compile yet
    return new Promise((resolve, reject) => {

        // get user
        getUserByUUID(userId).then(user => {

            // create temp folder filePath
            const tempFolderPath = path.join("temp", user.uuid);

            // create temp folder
            fs.mkdirSync(tempFolderPath, {recursive: true});
            console.info(`Temp Directory created at ${tempFolderPath} at ${new Date()}`);

            // User Data (user.json)
            const userJSONData = JSON.stringify(user, null, 4);
            const userFilePath = path.join(tempFolderPath, "user.json");

            fs.writeFileSync(userFilePath, userJSONData);
            console.info(`Temp file user.json created fro ${user.uuid} at ${new Date()}`);

            // Add additional data and create additional files here ----------------------------------

            // Create zip file
            const zip = new JSZip();

            // zip files
            
            // User Data
            zip.file("user.json", fs.readFileSync(userFilePath));


            // gerenate stream
            zip.generateNodeStream({type: "nodebuffer", streamFiles: true})
            .pipe(fs.createWriteStream(path.join("temp", `user_${user.uuid}.zip`)))
            .on("finish", () => {
                // logging
                console.info(`Zip file created for ${user.uuid} at ${new Date()}. Cleaning up...`);

                // Remove original temp folder, leaving just zip file
                fs.rmSync(tempFolderPath, {recursive: true});
                console.info(`Original temp folder for user ${user.uuid} deleted on ${new Date()}`);
                console.info(`Zip file for user ${user.uuid} created at ${new Date()}`);

                // resolve zip file path
                resolve(path.join("temp", `user_${user.uuid}.zip`));
            });

        }, err => {
            reject(`Could not get user \n ${err}`);
        });

    });
};

module.exports = {
    // Users
    getUserByUUID,
    getUserByEmail,
    getAllUsers,
};