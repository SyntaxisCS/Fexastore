// Express
const express = require("express");
const session = require("express-session");
const cors = require("cors");

// .env file
require("dotenv").config();

// Passport
const passport = require("passport");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

// Postgres
const pg = require("pg");
const pgSession = require("connect-pg-simple")(session);

// App Initialization
const app = express();
const PORT = process.env.backendPort;

// Frontend Backend Connection and Body Parser
app.use(express.static("../frontend"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cors
app.use(cors({
    origin: ["localhost"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true
}));


app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`);
});