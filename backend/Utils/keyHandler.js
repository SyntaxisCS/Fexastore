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

// UUID Generation
const generateUUID = (email) => {
    // Generate random characters to ensure even repeat emails get a new uuid
    const randomBytes = crypto.randomBytes(4).toString("hex");
    const randomizedEmail = email+randomBytes;

    return uuid.v5(randomizedEmail, uuidNamespace);
};

// NanoId Generation
const generateNanoID = () => {
    let nano = customAlphabet(nanoAlphabet, 16);
    return nano();
};

const generateToken = () => {
    let nano = customAlphabet(nanoAlphabet, 32);
    return nano();
};

module.exports = {generateUUID, generateNanoID, generateToken};