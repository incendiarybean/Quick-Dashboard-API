const express = require("express");
const swaggerUi = require("swagger-ui-express");
const OpenApiValidator = require("express-openapi-validator");
const path = require("path");
const cors = require("cors");
const refParser = require("@apidevtools/json-schema-ref-parser");
const swaggerSpec = require("../../api/swagger/swagger.json");

const handler = async (app) => {
    const schema = await refParser.dereference(swaggerSpec);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(schema));

    app.use(cors());
    app.use(express.json());

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, x-api-key, Content-Type, Accept"
        );
        console.log(req.headers);
        if (!req.headers["x-api-key"])
            return res.status(403).json({
                message: "You're missing your API key!",
            });
        if (req.headers["x-api-key"] !== process.env.APIKEY)
            return res.status(403).json({
                message: "Incorrect API key!",
            });
        return next();
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
