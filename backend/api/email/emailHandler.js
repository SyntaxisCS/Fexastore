const nodeMailer = require("nodemailer");
const fs = require("fs");
// dotenv

// helper functions
const { generateToken } = require("../../Utils/keyHandler");
const { getUserByEmail, addVerificationToken, addEmailChangeToken } = require("../../../../BrainDump/backend/api/database/dbHandler");

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
        if (recipient) {
            
            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Thanks for joining _NAME_",
                html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background-color: #007bff; padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Account Creation Notification</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear [insert username here],</p><p style="margin-bottom: 20px;">Thank you for creating an account with [insert app name here]! Your account has been successfully created.</p><p>Please check your email for a separate email with instructions on how to verify your account.</p><p style="margin-top: 20px;">Best regards,</p><p>[insert app name here] Team</p></td></tr><tr> <td align="center" style="background-color: #007bff; padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 [insert app name here]. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });

        } else {
            reject("Recipient not provided");
        }
    });
};

// Password Change Notification
const sendPasswordChangeNotification = async (recipient) => {
    return new Promise((resolve, reject) => {
        if (recipient) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Your _NAME_ password has been changed!",
                html: ``
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });
        } else {
            reject("Recipient not provided");
        }
    });
};

// Email Change Notification
const sendEmailChangeNotification = async (oldRecipient, newRecipient) => {
    return new Promise((resolve, reject) => {

        if (oldRecipient && newRecipient) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: newRecipient, // to new email
                cc: oldRecipient, // send to old email
                subject: "Your _NAME_ email has been successfully changed!",
                html: ``
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Emails sent");
            }, err => {
                console.error(err);
                reject("Could not send emails");
            });

        } else {
            reject("Recipients not provided");
        }

    });
};

// Send Forgot Password Link
const sendForgotPasswordLink = async (recipient, url) => {
    return new Promise((resolve, reject) => {

        if (recipient && url) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Your _NAME_ password reset link has arrived!",
                html: ``
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });
        } else {
            reject("Recipient or url not provided");
        }
    });
};

// Send Email Verification Link
const sendEmailVerificationLink = async (recipient) => {
    return new Promise((resolve, reject) => {        
        if (recipient) {
            let verificationToken = generateToken();

            getUserByEmail(recipient).then(user => {
                addVerificationToken(user.uuid, verificationToken).then(url => {

                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: recipient,
                        subject: "",
                        html: ``
                    };

                    // Send Email
                    transporter.sendMail(mailOptions).then(info => {
                        resolve(`Email sent to ${recipient} on ${new Date()}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    });
                }, err => {
                    reject(err);
                });
            }, err => {
                reject(err);
            });
        } else {
            reject("Recipient not provided");
        }
    });
};

// Email Change Link
const sendEmailChangeLink = async (recipient) => {
    return new Promise((resolve, reject) => {

        // Check if recipient is provided
        if (recipient) {

            // Generate Token
            let token = generateToken();

            getUserByEmail(recipient).then(user => {

                addEmailChangeToken(user.uuid, token).then(url => {
                    
                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: recipient,
                        subject: "_NAME_ email change request",
                        html: ``
                    };

                    // Send Email
                    transporter.sendEmail(mailOptions).then(info => {
                        resolve(`Email change email sned to ${recipient} on ${new Date()}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    });
                }, err => {
                    reject(err);
                });
            }, err => {
                reject(err);
            });
        } else {
            reject("Recipient not provided");
        }
    });
};

// See how this will work with DO Spaces
const sendAccountData = async (recipient, filePath) => {
    return new Promise((resolve, reject) => {

        // check if recipient and file path is provided
        if (recipient && filePath) {

        } else {
            reject("Recipient or file path not provided");
        }
    });
};

module.exports = {
    sendAccountCreationNotification,
    sendPasswordChangeNotification,
    sendEmailChangeNotification,
    sendForgotPasswordLink,
    sendEmailChangeLink,
};