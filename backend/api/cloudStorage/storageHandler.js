const AWS = require("aws-sdk");

// Crypto
const crypto = require("crypto");

// Helpers
const {generateNanoID} = require("../../Utils/Helpers/keyHandler.js");
const {mimeTypeToFileType} = require("../../Utils/Helpers/fileHelpers.js");

const s3 = new AWS.S3({
    endpoint: process.env.spacesEndpoint,
    accessKeyId: process.env.spacesAccessKey,
    secretAccessKey: process.env.spacesSecretAccessKey,
});

const getFileById = async (id) => {
    return new Promise((resolve, reject) => {

        getSignedUrl(id).then(signedUrl => {
            resolve({
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
            Prefix: `uploads/${userId ? userId : "*"}/${groupId}`
        };

        s3.listObjectsV2(params, async (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                const files = [];
                const promises = data.Contents.map(file => {
                    return new Promise((resolve, reject) => {
                        getSignedUrl(file.Key).then(signedUrl => {
                            files.push({
                                key: file.Key,
                                url: signedUrl
                            });
                            resolve();
                        }, err => {
                            console.error(err);
                            reject(`Error generating url for ${file.Key}`);
                        });
                    });
                });

                Promise.all(promises).then(() => {
                    if (files.length > 0) {
                        resolve(files);
                    } else {
                        reject(`No files created`);
                    }
                }).catch(err => {
                    reject(err);
                })
            }
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
        let promises = [];

        // Only upload the first 10 files
        files.slice(0, 10).forEach((file) => {
            const randomBytes = crypto.randomBytes(8).toString("hex");
            const fileName = `${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}${randomBytes}-${new Date().toISOString()}`;
            const fileId = generateNanoID();

            const filePath = `uploads/${userId}/${fileGroupId}/${fileId}`;

            const params = {
            Bucket: process.env.spacesBucketName,
            Key: filePath,
            Body: file.buffer,
            ContentType: file.mimetype
            };

            // Push the promise returned by s3.upload() to the promises array
            promises.push(new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }

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

                    console.info(`File ${fileId} uploaded to DigitalOcean in ${fileGroupId} on ${new Date()}`);
                    // Resolve the promise with the fileDBObject
                    resolve(fileDBObject);
                });
            }));
        });

        // Wait for all the promises to resolve before resolving the main promise
        Promise.all(promises).then((results) => {
            resolve(results);
        }).catch((error) => {
            reject(error);
        });
    }
});
};
  

const addFiletoFileGroupInS3 = async (userId, fileGroupId, file) => {
    return new Promise((resolve, reject) => {
        if (!file && fileGroupId && userId) {
            reject("No file provided");
        } else {
            // upload file to fileGroup
            const randomBytes = crypto.randomBytes(8).toString("hex");
            const fileName = `${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}${randomBytes}-${new Date().toISOString()}`;
            const fileId = generateNanoID();

            const filePath = `uploads/${userId}/${fileGroupId}/${fileId}`;

            const params = {
                Bucket: process.env.spacesBucketName,
                Key: filePath,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            s3.upload(params).then(data => {

                let fileDBObject = {
                    id: fileId,
                    uploaderId: userId,
                    groupId: null,
                    uploadGroupId: fileGroupId,
                    numOfFiles: null,
                    doKey: filePath,
                    doBucket: process.env.spacesBucketName,
                    originalFileName: file.originalname,
                    systemFileName: fileName,
                    fileSize: file.size,
                    fileType: mimeTypeToFileType(file.mimetype)
                };

                resolve(fileDBObject);
            }, err => {
                console.error(err);
                reject(err);
            });
        }
    });
};

const deleteFileFromS3 = async (userId, fileGroupId, fileId) => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: process.env.spacesBucketName,
            Key: `uploads/${userId}/${fileGroupId}/${fileId}`
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve("File deleted");
            };
        });
    });
};

const deleteFileGroupFromS3 = async (userId, fileGroupId, fileIdArray) => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: process.env.spacesBucketName,
            Delete: {
                Objects: fileIdArray.map(key => ({Key: key})),
                Quiet: false
            }
        };

        s3.deleteObjects(params, (err, data) => {
            if (err) {
                reject(`Error deleted objects: ${err}`);
            }

            resolve(`Files ${fileIdArray} deleted successfully`);
        });
    });
};

const handleAvatarUpload = async (userId, file) => {
    return new Promise((resolve, reject) => {
        if (!file || !userId) {
            resolve(null);
        } else {
            const randomBytes = crypto.randomBytes(8).toString("hex");
            const fileName = `${randomBytes}-${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}`;
            const filePath = `avatars/${userId}-${fileName}`;

            const params = {
                Bucket: process.env.spacesBucketName,
                Key: filePath,
                Body: file.buffer,
                ContentType: file.fileType,
                ACL: "public-read"
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data.Location);
                }
            });
        }
    });
};

module.exports = {
    getFileById,
    getFilesByGroupId,
    getSignedUrl,
    createNewFileGroupInS3,
    addFiletoFileGroupInS3,
    deleteFileFromS3,
    deleteFileGroupFromS3,
    handleAvatarUpload,
};