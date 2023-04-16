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
                const fileName = `${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}${randomBytes}-${new Date().toISOString()}`;
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

const addFiletoFileGroupInS3 = async (userId, fileGroupId, file) => {
    return new Promise((resolve, reject) => {
        if (!file && fileGroupId && userId) {
            reject("No file provided");
        } else {
            // upload file to fileGroup
            const randomBytes = crypto.randomBytes(8).toString("hex");
            const fileName = `${file.originalname.length > 24 ? file.originalname.slice(0, 24) : file.originalname}${randomBytes}-${new Date().toISOString()}`;
            const fileId = generateNanoID();

            const filePath = `/${userId}/${fileGroupId}/${fileId}`;

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
        let params = {
            Bucket: process.env.spacesBucketName,
            Delete: {
                Objects: fileIdArray.map(key => ({Key: key})),
                Quiet: false
            }
        };

        s3.deleteObjects(params).then(data => {

            resolve(`Files ${fileIdArray} deleted successfully`);

        }, err => {
            reject(`Error deleted objects: ${err}`);
        });
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
};