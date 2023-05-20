// Packages
const {Client} = require("pg");
const bcrypt = require("bcrypt");
const validator = require("validator");
const fs = require("fs");
const JSZip = require("jszip");
const moment = require("moment");

// Helper functions
const aes256 = require("aes256");
const {generateNanoID, deriveKey, encryptKey, decryptKey} = require("../../Utils/Helpers/keyHandler");
const {hasNotExpired} = require("../../Utils/Helpers/timeHandler");
const { uploadDupeChecker } = require("../../Utils/Helpers/uploadDupeChecker");

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

const getUserByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUserByUsername",
            text: "SELECT * FROM users WHERE username = $1",
            values: [username]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject({
                    status: 404,
                    message: "No users found with that username"
                });
            }
        }, err => {
            reject({
                status: 500,
                message: "Failed to get user by username",
                details: err.message
            });
        });
    });
};

const getAllUsers = async () => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getAllUsers",
            text: "SELECT * FROM users"
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
                        createKey(newUser.uuid, encryptedKey).then(response => {
                            console.info(response);
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

                                const columns = ['uuid', 'first_name', 'last_name', 'username', 'email', 'email_verified', 'email_verified_date', 'number_of_email_changes', 'last_email_change', 'password', 'number_of_password_changes', 'last_password_change', 'date_joined', 'number_of_uploads', 'last_upload_date', 'number_of_downloads', 'last_download_date', 'user_type', 'plan_type', 'trial_used', 'trial_expiration_date', 'months_paid', 'number_of_reported_uploads', 'last_report_date', 'avatar_url'];
                                const values = [newUser.uuid, newUser.firstName, newUser.lastName, newUser.username, normalizedEmail, false, null, 0, null, hashedPassword, 0, null, currentTimestamp, 0, null, 0, null, "user", "free", false, null, 0, 0, null, newUser.avatarUrl];

                                let query = {
                                    name: 'createUser',
                                    text: `INSERT INTO users (${columns.join(', ')}) VALUES (${values.map((_, i) => '$' + (i + 1)).join(', ')})`,
                                    values
                                };

                                DB.query(query).then(response => {

                                    if (response.rowCount > 0) {
                                        // success
                                        resolve(`User ${newUser.uuid} created at ${new Date()}`);
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
                            reject(err);
                        });

                    }, err => {
                        console.error(err);
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
                    reject("Could not change email");
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
                    deleteVerificationToken(user.uuid).then(response => {
                        resolve(`${user.uuid} has verified the email ${email}`);
                    }, err => {
                        console.error(err);
                        reject("Could not verify email");
                    });
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
                text: "UPDATE users SET number_of_downloads = $1,last_download_date = $2 WHERE email = $3",
                values: [newDownloadNumber, timestamp, email]
            };

            DB.query(query).then(response => {

                resolve(`${user.uuid} has downloaded ${numOfDownloads} new files on ${timestamp} bringing their total to ${newDownloadNumber}`);

            }, err => {
                console.error(err);
                reject("Could not update user download number");
            });

        }, err => {
            console.error(err);
            reject("User does not exist");
        });
    });
};

const addUserUploadNumber = async (email, numOfUploads) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {

            // new number of uploads
            let newUploadNumber = email.number_of_uploads + numOfUploads;

            // last upload date
            let timestamp = new Date();

            let query = {
                name: "addUserUploadNumber",
                text: "UPDATE users SET number_of_uploads = $1,last_upload_date = $2 WHERE email = $3",
                values: [newUploadNumber, timestamp, email]
            };

            DB.query(query).then(response => {

                resolve(`${user.uuid} has uploaded ${numOfUploads} new files on ${timestamp} bringing their total to ${newUploadNumber}`);

            }, err => {
                console.error(err);
                reject("Could not update user upload number");
            });

        }, err => {
            console.error(err);
            reject("User does not exist");
        });
        

    });
};

const changeUserNameVisibility = async (email, newVis) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {

            if (user.name_visibility === newVis) {
                reject(`Visibility is already set to ${newVis}`);
            } else {

                let query = {
                    name: "changeUserNameVisibility",
                    text: "UPDATE users SET name_visibility = $1 WHERE email = $2",
                    values: [newVis, email]
                };

                DB.query(query).then(response => {
                    resolve(`${user.uuid} name visibility changed to ${newVis} on ${new Date()}`);
                }, err => {
                    console.error(err);
                    reject("Could not update user name visibility");
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

// Uploads -----------------------------------------------------------------------

const getUploadById = async (id) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUploadById",
            text: "SELECT * FROM uploads WHERE id = $1",
            values: [id]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Could not find any uploads with that id");
            }
        }, err => {
            console.error(err);
            reject(err);
        });
    });
};

// returns array of up to max number of files per group (currently 10)
const getUploadGroupById = async (id) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUploadGroupById",
            text: "SELECT * FROM uploads WHERE upload_group_id = $1",
            values: [id]
        };

        DB.query(query).then(response => {
            if (response.rows.length > 0) {

                resolve(response.rows);

            } else {
                reject("No files with that group id");
            }

        }, err => {
            console.error(err);
            reject(err);
        });
    });
};

const getUploadsByUserId = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUploadsByUserId",
            text: "SELECT * FROM uploads WHERE uploader_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {

            if (response.rows.length > 0) {
                resolve(uploadDupeChecker(response.rows));
            } else {
                reject("No files with that uploader id");
            }

        }, err => {
            console.error(err);
            reject(err);
        });
    });
};

const createUpload = async (x) => {
    return new Promise((resolve, reject) => {
        // time stamp = updated_date = creation_date on creation
        let timestamp = new Date();

        const columns = ['id', 'uploader_id', 'group_id', 'upload_group_id', 'num_of_files_in_group', 'title', 'description','tags', 'use_case', 'do_key', 'do_bucket', 'creation_date', 'updated_date', 'original_file_name', 'system_file_name', 'file_size', 'file_type'];
        const values = [x.id, x.uploaderId, x.groupId, x.uploadGroupId, x.numOfFiles, x.title, x.description, x.tags, x.useCase, x.doKey, x.doBucket, timestamp, timestamp, x.originalFileName, x.systemFileName, x.fileSize, x.fileType];

        let query = {
            name: "createUpload",
            text: `INSERT INTO uploads (${columns.join(', ')}) VALUES (${values.map((_, i) => '$' + (i + 1)).join(', ')})`,
            values
        };        

        DB.query(query).then(response => {
            if (response.rowCount > 0) {
                // success
                resolve(`Upload with id ${x.id} apart of group ${x.uploadGroupId} (${x.numOfFiles} files) created on ${timestamp} for user ${x.uploaderId}`);
            } else {
                reject("Could not create upload!");
            }
        }, err => {
            // fail
            console.error(err);
            reject(err);
        });

    });
};

const deleteUpload = async (id) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteUpload",
            text: "DELETE FROM uploads WHERE id = $1",
            values: [id]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const deleteUploadGroup = async (groupId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteUploadGroup",
            text: "DELETE FROM uploads WHERE upload_group_id = $1",
            values: [groupId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
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

// Email Verification Tokens
const addVerificationToken = async (userId, token) => {
    return new Promise((resolve, reject) => {
        // check if already exists
        getVerificationToken(userId).then(oldToken => {
            // delete then create
            deleteVerificationToken(userId).then(success => {

                // create token
                let expire = moment().add(10, "minutes").toISOString();

                const url = `${frontendURL}/verify/${token}`;

                let query = {
                    name: "addVerificationToken",
                    text: "INSERT INTO verification_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
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
                    console.error(err);
                    reject(err);
                });

            }, err => {
                // failed to delete
                console.error(err);
                reject("Token already exists, could not delete old token, therefore did not create new token");
            });
        }, err => {{
            // if no then create
            // create token
            let expire = moment().add(10, "minutes").toISOString();

            const url = `${frontendURL}/verify/${token}`;

            let query = {
                name: "addVerificationToken",
                text: "INSERT INTO verification_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
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
                console.error(err);
                reject(err);
            });
        }});
    });
};

// get token by user UUID
const getVerificationToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getVerificationToken",
            text: "SELECT * FROM verification_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Token does not exist");
            }
        }, err => {
            reject(err);
        });
    });
};

const checkVerificationToken = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkVerificationToken",
            text: "SELECT * FROM verification_tokens WHERE token = $1",
            values: [token]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                // checks if token expired only resolves if it hasn't
                if (hasNotExpired(response.rows[0].expire)) {
                    resolve(response.rows[0]);
                } else {
                    // if token expired delete and reject
                    deleteVerificationToken(response.rows[0].user_id).then(success => {
                        reject("Token has expired");
                    }, err => {
                        console.error(err);
                        reject("Token has expired");
                    });
                }
            } else {
                reject("Token does not exist");
            }
        }, err => {
            reject(err);
        });
    });
};

const deleteVerificationToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteVerificationToken",
            text: "DELETE FROM verification_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Email Change Tokens
const addEmailChangeToken = async (userId, oldToken, newToken, oldEmail, newEmail) => {
    return new Promise((resolve, reject) => {
        // check if already exists
        getEmailChangeToken(userId).then(oldtoken => {
            // delete then create
            deleteEmailChangeToken(userId).then(success => {

                // create token
                let expire = moment().add(10, "minutes").toISOString();

                let query = {
                    name: "addEmailChangeToken",
                    text: "INSERT INTO email_change_tokens (user_id, token, old_email, old_email_consent, new_email, expire) VALUES ($1,$2,$3,$4,$5,$6)",
                    values: [userId, oldToken, oldEmail, false, newToken, newEmail, expire]
                };

                DB.query(query).then(response => {
                    if (response.rowCount > 0) {
                        // success
                        resolve({oldToken, newToken});
                    } else {
                        reject("Could not add token");
                    }
                }, err => {
                    console.error(err);
                    reject(err);
                });
            }, err => {
                // failed to delete
                console.error(err);
                reject("Token already exists, and could not delete old token");
            });
        }, err => {
            // does not exist so create
            // create token
            let expire = moment().add(10, "minutes").toISOString();

            let query = {
                name: "addEmailChangeToken",
                text: "INSERT INTO email_change_tokens (user_id, token, old_email, old_email_consent, new_email, expire) VALUES ($1,$2,$3,$4,$5,$6)",
                values: [userId, token, oldEmail, false, newEmail, expire]
            };

            DB.query(query).then(response => {
                if (response.rowCount > 0) {
                    // success
                    resolve({oldToken, newToken});
                } else {
                    reject("Could not add token");
                }
            }, err => {
                console.error(err);
                reject(err);
            });
        });
    });
}

const getEmailChangeToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getEmailChangeToken",
            text: "SELECT * FROM email_change_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Token does not exist");
            }
        }, err => {
            reject(err);
        })
    });
}

const checkEmailChangeToken = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkEmailChangeToken",
            text: "SELECT * FROM email_change_tokens WHERE token = $1",
            values: [token]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                // checks if token expired only resolves if it hasn't
                if (hasNotExpired(response.rows[0].expire)) {
                    resolve(response.rows[0]);
                } else {
                    // remove expired token
                    deleteEmailChangeToken(response.rows[0].user_id).then(response => {
                        reject("Token expired, deleted token");
                    }, err => {
                        console.error(err);
                        reject("Token expired, could not delete token");
                    });
                }
            } else {
                reject("Token does not exist");
            }
        }, err => {
            reject(err);
        });
    });
}

const deleteEmailChangeToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteEmailChangeToken",
            text: "DELETE FROM email_change_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        })
    });
}

const emailChangeTokenFirstEmailConsent = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "emailChangeTokenFirstEmailConsent",
            text: "UPDATE email_change_tokens SET old_email_consent = $1 WHERE token = $2",
            values: [true, token]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    })
};

module.exports = {
    // Users
    getUserByUUID,
    getUserByEmail,
    getUserByUsername,
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
    changeUserNameVisibility,
    authenticate,

    // User Privacy
    downloadAccountData,

    // Uploads
    getUploadById,
    getUploadGroupById,
    getUploadsByUserId,
    createUpload,
    deleteUpload,
    deleteUploadGroup,

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

    // Email Verification Tokens
    addVerificationToken,
    getVerificationToken,
    checkVerificationToken,
    deleteVerificationToken,

    // Email Change Tokens
    addEmailChangeToken,
    getEmailChangeToken,
    checkEmailChangeToken,
    deleteEmailChangeToken,
    emailChangeTokenFirstEmailConsent,
};