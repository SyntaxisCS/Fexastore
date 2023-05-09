const nodeMailer = require("nodemailer");
const fs = require("fs");
// dotenv

// helper functions
const { generateToken } = require("../../Utils/Helpers/keyHandler");
const { getUserByEmail, addVerificationToken, addEmailChangeToken, getEmailChangeToken } = require("../database/dbHandler");

// URLs
const frontendURL = process.env.frontendURL;
const backendURL = process.env.backendURL;

const emailSender = process.env.mailUser;
let transporter = nodeMailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: emailSender,
        pass: process.env.mailPass
    }
});

// Production Transporters
/*

// Zoho Mail
let transporter = nodeMailer.createTransport({
    host: "smtp.zoho.com",
    secure: true,
    port: 465,
    auth: {
        user: emailSender,
        pass: process.env.mailPass
    }
});

// Proton Mail
*/

// Account Creation Notification
const sendAccountCreationNotification = async (recipient, userInfo) => {
    return new Promise((resolve, reject) => {
        if (recipient) {
            
            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: `Thanks for joining Fexastore`,
                html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Account Creation Notification</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${userInfo ? userInfo.username : "_username_"},</p><p style="margin-bottom: 20px;">Thank you for creating an account with Fexastore! Your account has been successfully created.</p><p>Please check your email for a separate email with instructions on how to verify your account.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
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

            // get user
            getUserByEmail(recipient).then(user => {
                // Create Email Options
                const mailOptions = {
                    from: emailSender,
                    to: recipient,
                    subject: "Your Fexastore password has been changed!",
                    html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Password Change Notification</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${user.username ? user.username : "_username_"},</p><p style="margin-bottom: 20px;">This is to inform you that the password associated with your Fexastore account has been changed.</p><p>If you did not request this change, please contact us immediately at support@fexastore.com.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
                };

                // Send Email
                transporter.sendMail(mailOptions).then(info => {
                    resolve("Email sent");
                }, err => {
                    console.error(err);
                    reject("Could not send email");
                });
            }, err => {
                reject(err);
            });
        } else {
            reject("Recipient not provided");
        }
    });
};

// Email Change Notification - sends notification of email change to both new and old emails
const sendEmailChangeNotification = async (oldEmail, newEmail) => {
    return new Promise((resolve, reject) => {
        if (oldEmail, newEmail) {

            // get user
            getUserByEmail(newEmail).then(user => {
                
                // Create Email Options
                const mailOptions = {
                    from: emailSender,
                    to: newEmail,
                    cc: oldEmail,
                    subject: "Fexastore account email changed",
                    html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Email Change Notification</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${user.username ? user.username : "_username_"},</p><p style="margin-bottom: 20px;">This is to inform you that the email associated with your Fexastore account has been changed to ${user.email ? user.email : "_newEmail_"}.</p><p>If you did not request this change, please contact us immediately at support@fexastore.com.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
                };

                // Send Email
                transporter.sendMail(mailOptions).then(info => {
                    resolve(`Email sent to ${newEmail} and ${oldEmail} on ${new Date()}`);
                }, err => {
                    console.error(err);
                    reject("Could not send emails");
                });
            }, err => {
                reject(err);
            });
        } else {
            reject("Missing old and new emails");
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
                subject: "Your Fexastore password reset link has arrived!",
                html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Forgot Password?</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${user.username ? user.username : "_username_"},</p><p style="margin-bottom: 20px;">You recently requested to reset your password for your Fexastore account. To reset your password, please click the button below:</p><table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;"> <tr> <td align="center" bgcolor="#5d02fb" style="border-radius: 5px;"> <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">Reset Password</a> </td></tr></table> <p>If the button above doesn't work, you can also reset your password by copying and pasting the following URL into your browser:</p><p>${url}</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
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
const sendEmailVerificationLink = async (recipient, userInfo) => {
    return new Promise((resolve, reject) => {        
        if (recipient) {
            let verificationToken = generateToken();

            getUserByEmail(recipient).then(user => {
                addVerificationToken(user.uuid, verificationToken).then(url => {

                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: recipient,
                        subject: "Your Fexastore Email Verification Link has arrived",
                        html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Email Verification</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${userInfo.username ? userInfo.username : "_username_"},</p><p style="margin-bottom: 20px;">Thank you for creating an account with Fexastore! Before you can start using your account, you need to verify your email address by clicking the button below:</p><table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;"> <tr> <td align="center" bgcolor="#5d02fb" style="border-radius: 5px;"> <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">Verify Email Address</a> </td></tr></table> <p>If you did not create an account with Fexastore, please ignore this email.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
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

// Email Change

// get consent to change email from old email
const sendInitialEmailChange = async (oldEmail, newEmail) => {
    return new Promise((resolve, reject) => {
        if (oldEmail && newEmail) {
            let oldEmailToken = generateToken();
            let newEmailToken = generateToken();

            getUserByEmail(recipient).then(user => {
                addEmailChangeToken(user.uuid, oldEmailToken, newEmailToken, oldEmail, newEmail).then(response => {

                    const url = `${frontendURL}/emailrequest/consent/1/${response.oldToken}`;

                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: oldEmail,
                        subject: "An email change request on your Fexastore account has started",
                        html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Email Change Request</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${user.username ? user.username : "_username_"},</p><p style="margin-bottom: 20px;">We received a request to change the email associated with your Fexastore account. To ensure that this request is legitimate, please click the button below:</p><table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;"> <tr> <td align="center" bgcolor="#5d02fb" style="border-radius: 5px;"> <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">Verify request</a> </td></tr></table> <p>If you did not request an email change, please change your password immediately.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
                    };

                    // Send Email
                    transporter.sendMail(mailOptions).then(info => {
                        resolve(`Email sent to ${oldEmail} on ${new Date()}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    })

                }, err => {
                    reject(err);
                })
            }, err => {
                reject(err);
            });
        } else {
            reject("Missing old and new emails");
        }
    });
};

// get consent to change email from new email
const sendNewEmailChangeVerification = async (oldEmail, newEmail) => {
    return new Promise((resolve, reject) => {
        if (oldEmail, newEmail) {
            
            // get user
            getUserByEmail(oldEmail).then(user => {
                getEmailChangeToken(user.user_id).then(token => {

                    const url = `${frontendURL}/emailrequest/consent/2/${token.newToken}`;

                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: newEmail,
                        subject: "Fexastore account email change request",
                        html: `<html> <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; background-color: #f2f2f2;"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="600"> <tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <h1 style="font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Email Change Request</h1> </td></tr><tr> <td align="left" style="background-color: #ffffff; padding: 30px;"> <p style="margin-bottom: 20px;">Dear ${user.username ? user.username : "_username_"},</p><p style="margin-bottom: 20px;">We received a request to change the email relating to the Fexastore account with the email ${user.email ? user.email : _email_}. To confirm this change please click the button below and we will start processing your request.</p><table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;"> <tr> <td align="center" bgcolor="#5d02fb" style="border-radius: 5px;"> <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">Complete Request</a> </td></tr></table> <p>If the button above does not work please copy and paste this url into your browser: ${url}</p><p>If you did not request an email change, you can safely ignore and delete this email.</p><p style="margin-top: 20px;">Best regards,</p><p>Fexastore Team</p></td></tr><tr> <td align="center" style="background: linear-gradient(to right, #5d02fb 0%, #EC02F7 140%); padding: 30px 0;"> <p style="color: #ffffff; margin: 0;">&copy; 2023 Fexastore. All rights reserved.</p></td></tr></table> </td></tr></table> </body></html>`
                    };

                    // Send Email
                    transporter.sendMail(mailOptions).then(info => {
                        resolve(`Email sent to ${newEmail} on ${new Date()}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    });

                }, err => {
                    reject(err);
                });
            });
        } else {
            reject("Missing old and new emails");
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
    // Notifcations
    sendAccountCreationNotification,
    sendPasswordChangeNotification,
    sendEmailChangeNotification,

    // Passwords
    sendForgotPasswordLink,

    // Emails
    sendEmailVerificationLink,
    sendInitialEmailChange,
    sendNewEmailChangeVerification,

    // Account Data
    sendAccountData
};