// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../.env")});

// UUID
const uuid = require("uuid");
const uuidNamespace = process.env.uuidNamespace;

// NanoId
const {customAlphabet} = require("nanoid");
const nanoAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

// Crypto
const crypto = require("crypto");

// Encryption
const pbkdf2 = require("pbkdf2");
const aes256 = require("aes256");

// UUID Generation
const generateUUID = (email) => {
    // Generate random characters to ensure even repeat emails get a new uuid
    const randomBytes = crypto.randomBytes(4).toString("hex");
    const randomizedEmail = email+randomBytes;

    return uuid.v5(randomizedEmail, uuidNamespace);
};

// NanoId Generation
const generateNanoID = () => {
    let nano = customAlphabet(nanoAlphabet, 64);
    return nano();
};

const generateToken = () => {
    let nano = customAlphabet(nanoAlphabet, 32);
    return nano();
};

// Encryption Key Handling
const deriveKey = (userId, plainTextPasword, salt) => {
    return new Promise((resolve, reject) => {
        pbkdf2.pbkdf2(plainTextPasword, salt, 100000, 512, "sha512", (err, key) => {
            if (err) {
                reject(err);
            } else {
                let base64 = key.toString("base64");

                resolve(base64);
            }
        });
    });
};

const encryptKey = (key) => {
    const encryptionKey = process.env.encryptionKey;

    let encryptedKey = aes256.encrypt(encryptionKey, key);

    return encryptedKey;
};

const decryptKey = (key) => {
    const encryptionKey = process.env.encryptionKey;

    let plainTextKey = aes256.decrypt(encryptionKey, key);

    return plainTextKey;
};

module.exports = {
    // IDs
    generateUUID, 
    generateNanoID, 
    generateToken,

    // Encryption Keys
    deriveKey,
    encryptKey,
    decryptKey
};