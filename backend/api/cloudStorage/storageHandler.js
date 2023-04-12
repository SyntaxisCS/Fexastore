const AWS = require("aws-sdk");

// Crypto
const crypto = require("crypto");

// Helpers
const {generateNanoID} = require("../../Utils/keyHandler.js");
const {mimeTypeToFileType} = require("../../Utils/fileHelpers.js");

const s3 = new AWS.S3({
    endpoint: new AWS.endpoint(process.env.spacesEndpoint),
    accessKeyId: process.env.spacesAccessKey,
    secretAccessKey: process.env.spacesSecretAccessKey,
});

const getFileById = async (id) => {
    return new Promise((resolve, reject) => {

        getSignedUrl(id).then(signedUrl => {
            resolve({
                bucket: process.env.spacesBucketName,
                key: id,
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

const getFilesByGroupId = async (userId, groupId) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.spacesBucketName,
            Prefix: `/${userId ? userId : "*"}/${groupId}`
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

const getSignedUrl = async (id) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.spacesBucketName,
            Key: id,
            Expires: 60 * 60 // 1 hour (seconds)
        };

        s3.getSignedUrlPromise("getObject", params).then(url => {
            resolve(url);
        }, err => {
            if (err.code === 'NoSuchKey') {
                console.error(err);
                reject(`No such key`);
            } else {
                console.error(`Error generating signed URL for ${id}: ${err}`);
                reject(err);
            }
        });
    });
};

const createNewFileGroupInS3 = async (files, userId) => {
    return new Promise((resolve, reject) => {
        if (!files) {
            reject("No files provided");
        } else {
            const fileGroupId = generateNanoID();
            let results = [];
            
            // Only upload the first 10 files
            files.slice(0, 10).forEach((file) => {
                const randomBytes = crypto.randomBytes(8).toString("hex");
                const fileName = `${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}${randomBytes}-${new Date()}`;
                const fileId = generateNanoID();

                const filePath = `/${userId}/${fileGroupId}/${fileId}`;

                const params = {
                    Bucket: process.env.spacesBucketName,
                    Key: filePath,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                s3.upload(params).then((data) => {

                    let numOfFiles = files.length > 10 ? 10 : files.length;
                    let fileDBObject = {
                        id: fileId,
                        uploaderId: userId,
                        groupId: null,
                        uploadGroupId: fileGroupId,
                        numOfFiles,
                        doKey: filePath,
                        doBucket: process.env.spacesBucketName,
                        originalFileName: file.originalname,
                        systemFileName: fileName,
                        fileSize: file.size,
                        fileType: mimeTypeToFileType(file.mimetype)
                    };

                    results.push(fileDBObject);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            });

            resolve(results);
        }
    });
};

const deleteFileFromS3 = async (userId, fileGroupId, fileId) => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: process.env.spacesBucketName,
            Key: `${userId}/${fileGroupId}/${fileId}`
        };

        s3.deleteObject(params).then(data => {
            resolve("File deleted");
        }, err => {
            console.error(err);
            reject(err);
        });
    });
};

const deleteFileGroupFromS3 = async (userId, fileGroupId, fileIdArray) => {
    return new Promise((resolve, reject) => {
        
    });
};

module.exports = {
    getFileById,
    getFilesByGroupId,
    getSignedUrl,
    createNewFileGroupInS3,
    deleteFileFromS3,
    deleteFileGroupFromS3,
};