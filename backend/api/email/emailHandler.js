const nodeMailer = require("nodemailer");
const fs = require("fs");
// dotenv

// helper functions
const { generateToken } = require("../../Utils/keyHandler");

// URLs
const frontendURL = process.env.frontendURL;
const backendURL = process.env.backendURL;

const emailSender = process.env.mailUser;
let transporter = nodeMailer.createTransport({
    host: "smtp.zoho.com",
    secure: true,
    port: 465,
    auth: {
        user: emailSender,
        pass: process.env.mailPass
    }
});

// Dev Transporter
/*
let transporter = nodeMailer.createTransport({
    host: "smtp.zoho.com",
    secure: true,
    port: 465,
    auth: {
        user: emailSender,
        pass: process.env.mailPass
    }
});
*/

// Account Creation Notification
const sendAccountCreationNotification = async (recipient) => {
    return new Promise((resolve, reject) => {

    });
};