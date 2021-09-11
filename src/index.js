const express = require("express");
const fs = require("fs");
const app = express();
const handlers = require("./handlers");

require("dotenv").config();

const PORT = process.env.PORT || 8000;

process.env.NODE_ENV = process.env.NODE_ENV
    ? process.env.NODE_ENV
    : "development";
console.log(`[${new Date().toISOString()}] ENV: ${process.env.NODE_ENV}`);

require("https")
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

handlers.Routes(app);
handlers.Discord.init();
