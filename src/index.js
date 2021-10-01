const express = require("express");
const fs = require("fs");

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 8000;

process.env.NODE_ENV = process.env.NODE_ENV
    ? process.env.NODE_ENV
    : "development";
console.log(`[${new Date().toISOString()}] ENV: ${process.env.NODE_ENV}`);

const server = require("https")
    .createServer(
        {
            pfx: fs.readFileSync("./cert/certificate.pfx"),
            passphrase: process.env.PFX_KEY,
        },
        app
    )
    .listen(PORT, (err) => {
        if (err) throw err;
        console.log(
            `[${new Date().toISOString()}] Server is active on port: ${PORT}`
        );
    });

const handlers = require("./handlers");

handlers.Routes(app);
handlers.Discord.init(server);
