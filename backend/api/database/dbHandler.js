// Packages
const {Client} = require("pg");
const bcrypt = require("bcrypt");
const validator = require("validator");
const fs = require("fs");
const JSZip = require("jszip");
const moment = require("moment");

// Helper functions
const aes256 = require("aes256");
const {generateNanoID, deriveKey, encryptKey, decryptKey} = require("../../Utils/keyHandler");
const {hasNotExpired} = require("../../Utils/timeHandler");

// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../../.env")});

// URLs
const frontendURL = process.env.frontendURL;
const backendURL = process.env.backendURL;


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

                    isUsernameUnique(newUser.username).then(success => {

                        // DB query
                        let currentTimestamp = new Date();

                        const columns = ['uuid', 'first_name', 'last_name', 'username', 'email', 'email_verified', 'email_verified_date', 'number_of_email_change', 'last_email_change', 'password', 'number_of_password_changes', 'last_password_change', 'data_joined', 'number_of_uploads', 'last_upload_date', 'number_of_downloads', 'last_download_date', 'user_type', 'plan_type', 'trial_used', 'trial_expiration_date', 'months_paid', 'number_of_reported_uploads', 'last_report_date'];
                        const values = [newUser.uuid, newUser.firstName, newUser.lastName, newUser.username, normalizedEmail, false, null, 0, null, hashedPassword, 0, null, currentTimestamp, 0, null, 0, null, "user", "free", false, null, 0, 0, null];

                        let query = {
                            name: 'createUser',
                            text: `INSERT INTO users (${columns.join(', ')}) VALUES (${values.map((_, i) => '$' + (i + 1)).join(', ')})`,
                            values
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
                    reject("Could not verify email");
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

const addUserDownloadNumber = async (email, numOfDownloads) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {

            // new number of downloads
            let newDownloadNumber = email.number_of_downloads+numOfDownloads;

            // last download date
            let timestamp = new Date();

            let query = {
                name: "addUserDownloadNumber",
                text: "UPDATE users SET number_of_downloads = $1,last_download_date=$2 WHERE email = $3",
                values: [newDownloadNumber, timestamp, email]
            };

            DB.query(query).then(response => {

                resolve(`${user.uuid} has downloaded ${numOfDownloads} new files on ${timestamp} bringing their total to ${newDownloadNumber}`);

            }, err => {
                console.error(err);
                reject("Could not verify email");
            });

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

// KEYS --------------------------------------------------------------------------

// key is already encrypted
const createKey = async (userId, key) => {
    return new Promise((resolve, reject) => {
        // timeStamp = updated_date = creation_date on creation
        let timestamp = new Date();

        let query = {
            name: "createKey",
            text: "INSERT INTO keys (user_id, key, updated_date, creation_date) VALUES ($1,$2,$3,$4)",
            values: [userId, key, timestamp, timestamp]
        };

        DB.query(query).then(response => {
            if (response.rowCount > 0) {
                // success
                resolve(`Key for user: ${userId} created on ${timestamp}`);
            } else {
                reject("Could not create key!");
            }
        }, err => {
            // fail
            console.log(err);
            reject(err);
        });
    });
};

const updateKey = async (userId, key) => {
    return new Promise((resolve, reject) => {
        let updatedTimestamp = new Date();

        let query = {
            name: "updateKey",
            text: "UPDATE keys SET key = $1, updated_date = $2 WHERE user_id = $3",
            values: [key, updatedTimestamp, userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const deleteKey = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteKey",
            text: "DELETE FROM keys WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Key needs to be decrypted
const getKey = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getKey",
            text: "SELECT * FROM keys WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            // decrypt key
            if (response.rows[0]) {
                let key = response.rows[0].key;

                let decryptedKey = decryptKey(key);

                resolve(decryptedKey);
            } else {
                reject("Could not get key");
            }
        }, err => {
            reject(err);
        });
    });
};

// TOKENS -------------------------------------------------------------------------

// Password Tokens
const addPasswordToken = async (userId, token) => {
    return new Promise((resolve, reject) => {
        // check if token exists
        getPasswordToken(userId).then(token => {
            // delete then create
            deletePasswordToken(userId).then(success => {
                // token deleted, create new
                let expire = moment().add(10, "minutes").toISOString();

                const url = `${frontendURL}/forgotpassword/${token}`;

                let query = {
                    name: "addPasswordToken",
                    text: "INSERT INTO password_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                    values: [userId, token, expire]
                };

                DB.query(query).then(response => {
                    if (response.rowCount > 0) {
                        // success
                        resolve(url);
                    } else {
                        reject("Could not add token");
                    }
                }, err => {
                    // fail
                    reject(err);
                });

            }, err => {
                // failed to delete
                console.error(err);
                reject("Token already exists, could not delete old token, therefore did not create new token");
            });

        }, err => {
            // token does not exist, proceed as normal
            let expire = moment().add(10, "minutes").toISOString();

            const url = `${frontendURL}/forgotpassword/${token}`;

            let query = {
                name: "addPasswordToken",
                text: "INSERT INTO password_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                values: [userId, token, expire]
            };

            DB.query(query).then(response => {
                if (response.rowCount > 0) {
                    // success
                    resolve(url);
                } else {
                    reject("Could not add token");
                }
            }, err => {
                // fail
                reject(err);
            });

        });
    });
};

// get token by user UUID
const getPasswordToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getPasswordToken",
            text: "SELECT * FROM password_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {

            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Could not get token");
            }

        }, err => {
            reject(err);
        });
    });
};

// Check which user is associated with a token (if it exists) as well as check if it has expired
const checkPasswordToken = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkPasswordToken",
            text: "SELECT * FROM password_tokens WHERE token = $1",
            values: [token]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                // Checks if token has expired only resolves if it hasn't
                if (hasNotExpired(response.rows[0].expire)) {
                    resolve(response.rows[0]);
                } else {
                    // if token has expired then delete and reject
                    deletePasswordToken(response.rows[0].user_id).then(success => {
                        reject("Token has expired");
                    }, err => {
                        console.error(err);
                        reject(`Token has expired \n ${err}`);
                    });
                }

            } else {
                reject("Token does not exist");
            }
        }, err => {
            reject(`Couldn't check password token \n ${err}`);
        });
    });
};

const deletePasswordToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deletePasswordToken",
            text: "DELETE FROM password_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(`Password Token Deleted \n ${response}`);
        }, err => {
            reject(err);
        });
    });
};

module.exports = {
    // Users
    getUserByUUID,
    getUserByEmail,
    getAllUsers,
    isUsernameUnique,
    checkUserExistance,
    createUser,
    deleteUser,
    changeUserFirstName,
    changeUserLastName,
    changeUserUsername,
    changeUserEmail,
    verifyEmail,
    isVerified,
    authenticate,

    // User Privacy
    downloadAccountData,

    // Keys
    createKey,
    updateKey,
    deleteKey,
    getKey,

    // Tokens
    // Password Tokens
    addPasswordToken,
    getPasswordToken,
    checkPasswordToken,
    deletePasswordToken,
};