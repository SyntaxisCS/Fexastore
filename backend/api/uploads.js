// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// JSZip
const JSZip = require("jszip");

// Crypto
const crypto = require("crypto");

// Axios
const axios = require("axios");

// Multer
const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1 Gibibyte
        files: 10
    }
});

// Passport
const passport = require("passport");

// Router Initialization
const uploads = express.Router();

// Database handlers
const { createUpload, getUploadById, getUploadGroupById, getUploadsByUserId, deleteUpload } = require("./database/dbHandler");

// Helpers
const { getSignedUrl, createNewFileGroupInS3, deleteFileGroupFromS3, deleteFileFromS3, getFileById, getFilesByGroupId } = require("./cloudStorage/storageHandler");

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(403).send({error: "Not authenticated"});
    }
};

// Rate Limiters
const fileRequestLimiter = rateLimit({
    windowMs: 1000*60*15,
    max: 100,
    message: "Whoa, slow down! You are checking out too many files! Please try again in 15 minutes!",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

const uploadLimiter = rateLimit({
    windowMs: 1000*60*30,
    max: 15,
    message: "Whoa, slow down! You are providing too much data! Leave some for yourself... or try again in 30 minutes!",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

// Endpoints

// single file
uploads.get("/s:id", fileRequestLimiter, (req, res) => {
    const id = req.params.id;

    getUploadById(id).then(fileInfo => {
        res.status(200).send(fileInfo);
    }, err => {
        if (err === "Could not find any uploads with that id") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: "Server error"});
        }
    });
});

// multi file
uploads.get("/m:groupId", fileRequestLimiter, (req, res) => {
    const groupId = req.params.groupId;

    getUploadGroupById(groupId).then(groupInfo => {
        res.status(200).send(groupInfo);
    }, err => {
        if (err === "No files with that group id") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: "Server error"});
        }
    });
});

// All files for user
uploads.get("/u:userId", fileRequestLimiter, (req, res) => {
    const userId = req.params.userId;

    getUploadsByUserId(userId).then(uploadInfo => {
        res.status(200).send(uploadInfo);
    }, err => {
        if (err === "No files with that uploader id") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: "Server error"});
        }
    });
});

uploads.get("/download-s/:id", ensureAuthentication, fileRequestLimiter, (req, res) => {
    const fileId = req.params.id;

    getUploadById(fileId).then(fileInfo => {
        
        // get url
        getFileById(fileInfo.do_key).then(file => {
            res.status(200).send(info);
            
            // get file as blob
            axios.get(info.url, {responseType: "blob"}).then(response => {
                res.set("Content-Type", "application");
                // must set mimetype and file type
                res.set("Content-Disposition", `attachment; filename=${fileInfo.system_file_name}.${fileInfo.fileType}`);
                res.status(200).send(response.data);
            }, err => {
                console.error(err);
            });

        }, err => {
            if (err === "No such key") {
                res.status(404).send({error: err});
            } else {
                console.error(err);
                res.status(500).send({error: "Error getting that file"});
            }
        });

    }, err => {
        if (err === "Could not find any uploads with that id") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: "Server error"});
        }
    });
});

uploads.get("/download-m/:groupId", ensureAuthentication, fileRequestLimiter, (req, res) => {
    const groupId = req.params.groupId;

    getUploadGroupById(groupId).then(fileInfos => {

        getFilesByGroupId(groupId).then(files => {

            // zip file
            const zip = new JSZip();

            files.forEach(file => {

                // get file name
                let fileName = nameFromKey(file.key, fileInfos);
                if (fileName === "No provided files matched with the key provided") {
                    const randomBytes = crypto.randomBytes(12).toString("hex");
                    
                    // file was not provided just make fileName random characters
                    fileName = randomBytes;
                }

                // get file blob
                axios.get(file.url, {responseType: "blob"}).then(response => {
                    zip.file(fileName, response.data);
                }, err => {
                    console.error(`Error downloading file ${fileName}: ${err}`);
                });
            });

            // once the zip file is complete, send it to the client
            zip.generateAsync({type: "blob"}).then(zipBlob => {

                res.set("Content-Type", "application/zip");
                res.set("Content-Disposition", `attachment; filename=files.zip`);
                res.status(200).send(zipBlob);

            }, err => {
                console.error(err);
            });

        }, err => {
            if (err === "No such key") {
                res.status(404).send({error: err});
            } else {
                console.error(err);
                res.status(500).send({error: "Error getting that file"});
            }
        });

    }, err => {
        if (err === "No files with that group id") {
            res.status(404).send({error: err});
        } else {
            res.status(500).send({error: "Server error"});
        }
    });
});

uploads.post("/create", ensureAuthentication, uploadLimiter, upload.array("files"), (req, res) => {
    
    let upload = req.body;

    // Upload to DigitalOcean spaces
    createNewFileGroupInS3(req.files, req.session.user.uuid).then(fileDbObjects => {
        // Add references to database
        fileDbObjects.forEach(fileObject => {
            fileObject.title = upload.title;
            fileObject.description = upload.description;
            fileObject.tags = upload.tags === "" ? null : upload.tags;
            fileObject.useCase = upload.useCase === "" ? null : upload.useCase;

            createUpload(fileObject).then(response => {
                // do nothing
                console.info(`File added to database`);
            }, err => {
                console.error(err);
                res.status(500).send({error: "Failed to add upload to database"});
            });
        });

        res.status(201).send(`Created ${fileDbObjects.length} files`);
    }, err => {
        console.error(err);
        res.status(500).send({error: "Failed to add upload to storage"});
    });

});

// single file
uploads.delete("/s:id", ensureAuthentication, uploadLimiter, (req, res) => {
    const fileId = req.params.id;

    // get file info from database
    getFileById(fileId).then(fileInfo => {

        // delete file from cloud storage
        deleteFileFromS3(fileInfo.uploader_id, fileInfo.upload_group_id, fileId).then(success => {
            
            // delete file from database
            deleteUpload(fileId).then(success => {
                res.status(204).send(`${fileId} deleted`);
            }, err => {

                console.error(err);
                res.status(500).send({error: "Server error"});

            });
        });

    }, err => {
        if (err === "Could not find any uploads with that id") {
            res.status(404).send({error: "No uploads found with that id"});
        } else {
            console.error(err);
            res.status(500).send({error: "Server error"});
        }
    });
});

uploads.delete("/m:groupId", ensureAuthentication, uploadLimiter, (req, res) => {
    const groupId = req.params.groupId;

    if (groupId) {
        getUploadGroupById(groupId).then(fileGroupInfo => {

            let fileIds = [];

            // get file ids and delete from database
            fileGroupInfo.forEach(file => {
                fileIds.push(file.id);

                deleteUpload(file.id).then(success => {
                    // nothing
                }, err => {

                    console.error(err);
                    res.status(500).send({error: "Server error"});

                });
            });

            // delete files from cloud storage
            deleteFileGroupFromS3(fileGroupInfo[0].uploader_id, groupId, fileIds).then(success => {
                res.status(204).send(`${fileGroupInfo.length} files deleted`);
            }, err => {

                res.status(500).send({error: "Server error"});

            });

        }, err => {
            if (err === "No files with that group id") {
                res.status(404).send({error: err});
            } else {
                res.status(500).send({error: "Server error"});
            }
        }); 
    }
});


// Export Router
module.exports = uploads;