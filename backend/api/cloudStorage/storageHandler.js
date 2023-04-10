const AWS = require("aws-sdk");

// Crypto
const crypto = require("crypto");

// Helpers
import {generateNanoID} from "../../Utils/keyHandler.js";

const s3 = new AWS.S3({
    endpoint: new AWS.endpoint(process.env.spaces_endpoint),
    accessKeyId: process.env.spaces_access_key_id,
    secretAccessKey: process.env.spaces_secret_access_key,
});

const getFileByKey = async (key) => {
    return new Promise((resolve, reject) => {

        getSignedUrl(key).then(signedUrl => {
            resolve({
                bucket: process.env.spaces_bucket_name,
                key,
                url: signedUrl
            });
        }, err => {
            if (err === "No such key") {
                reject(err);
            } else {
                reject(err);
            }
        });

    });
};

const getFilesByGroupKey = async (userId, groupKey) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.spaces_bucket_name,
            Prefix: `/${userId ? userId : "*"}/${groupKey}`
        };

        s3.listObjectsV2(params).then(data => {
            const files = [];

            data.Contents.forEach(file => {

                getSignedUrl(file.Key).then(signedUrl => {
                    
                    files.push({
                        bucket: file.Bucket,
                        key: file.Key,
                        url: signedUrl
                    });

                }, err => {
                    console.error(err);
                    reject(`Error generating url for ${file.Key}`);
                });
            });

            if (files.length > 0) {
                resolve(files);
            } else {
                reject(``);
            }
        }, err => {
            console.error(err);
            reject(err);
        });
    });
};

const getSignedUrl = async (key) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.spaces_bucket_name,
            Key: key,
            Expires: 60 * 60 // 1 hour (seconds)
        };

        s3.getSignedUrlPromise("getObject", params).then(url => {
            resolve(url);
        }, err => {
            if (err.code === 'NoSuchKey') {
                console.error(err);
                reject(`No such key`);
            } else {
                console.error(`Error generating signed URL for ${key}: ${err}`);
                reject(err);
            }
        });
    });
};

const uploadFilesToS3 = async (files, userId) => {
    return new Promise((resolve, reject) => {
        if (!files) {
            reject("No files provided");
        } else {
            const fileGroupId = generateNanoID();
            let results = [];
            
            // Only upload the first 10 files
            files.slice(0, 10).forEach((file) => {
                const randomBytes = crypto.randomBytes(4).toString("hex");
                const fileName = `${file.originalname}${randomBytes}-${new Date()}`;

                const filePath = `/${userId}/${fileGroupId}/${fileName}`;

                const params = {
                    Bucket: process.env.spaces_bucket_name,
                    Key: filePath,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                s3.upload(params).then((data) => {

                    // add to database

                    results.push({
                        bucket: data.Bucket,
                        key: data.Key,
                        url: data.Location
                    });
                }, err => {
                    console.error(err);
                    reject(err);
                });
            });

            resolve({
                bucket: data.Bucket,
                key: data.Key,
                url: data.Location
            });
        }
    });
};

module.exports = {
    getFileByKey,
    getFilesByGroupKey,
    getSignedUrl,
    uploadFilesToS3
};