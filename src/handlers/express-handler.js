const express = require("express"),
    swaggerUi = require("swagger-ui-express"),
    OpenApiValidator = require("express-openapi-validator"),
    path = require("path"),
    cors = require("cors"),
    swaggerSpec = require("../../api/swagger/swagger"),
    refParser = require("@apidevtools/json-schema-ref-parser"),
    Discord = require("./discord-handler");

const handler = async (app) => {
    const schema = await refParser.dereference(swaggerSpec);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(schema));

    app.use(cors());
    app.use(express.json());

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        if (!req.headers["x-api-key"])
            return res.status(403).json({
                message: "You're missing your API key!",
            });
        if (req.headers["x-api-key"] !== process.env.APIKEY)
            return res.status(403).json({
                message: "Incorrect API key!",
            });
        next();
    });

    /*--------------------------*/
    /* Ensure APIKeyAuth Exists */
    /*--------------------------*/
    app.use(
        OpenApiValidator.middleware({
            apiSpec: swaggerSpec,
            validateRequests: true,
            validateResponses: true,
            operationHandlers: path.join(__dirname, "../../api/controllers"),
        })
    );
};

module.exports = handler;
