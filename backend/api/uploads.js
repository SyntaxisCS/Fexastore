// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Multer
const multer = require("multer");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `${__dirname}/temp`);
        },
        filename: (req, file, cb) => {
            cb(null, `${new Date().toISOString()}-${file.originalname}`);
        }
    }),
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
const { createUpload, getUploadById, getUploadGroupById } = require("./database/dbHandler");

// Helpers
const { getSignedUrl, createNewFileGroupInS3, deleteFileGroupFromS3 } = require("./cloudStorage/storageHandler");
const { deleteUpload } = require("./database/dbHandler");

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

uploads.get("/download-s/:id", ensureAuthentication, fileRequestLimiter, (req, res) => {
    const fileId = req.params.id;

    getUploadById(fileId).then(fileInfo => {
        
        // get url
        getSignedUrl(fileInfo.do_key).then(url => {
            res.status(200).send(url);
        }, err => {
            if (err === "No such key") {
                res.status(404).send({error: err});
            } else {
                console.error(err);
                res.status(500).send({error: "Error generating signed URL for that file"});
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

uploads.post("/create", ensureAuthentication, uploadLimiter, upload.array("files"), (req, res) => {
    
    // Upload to DigitalOcean spaces
    createNewFileGroupInS3(req.files, req.session.uuid).then(fileDbObjects => {

        // Add references to database
        fileDbObjects.forEach(fileObject => {
            createUpload(fileObject).then(response => {
                // do nothing
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

                });
            });

            // delete files from cloud storage
            deleteFileGroupFromS3(fileGroupInfo[0].uploader_id, groupId, fileIds).then(success => {
                res.status(204).send(`${fileGroupInfo.length} files deleted`);
            }, err => {

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