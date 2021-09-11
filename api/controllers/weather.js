"use strict";

const db = require("../adapters/db");

//////////////////
//// ACTIONS /////
//////////////////

const listWeather = async (req, res) => {
    try {
        return res.json(
            await db.select("weatherDaily").then((data) => {
                data.location = data.items.features[0].properties.location.name;
                data.days = data.items.features[0].properties.timeSeries;
                return data;
            })
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

//////////////////
//// HANDLER /////
//////////////////

const getWeather = (req, res) => {
    return listWeather(req, res);
};

module.exports = {
    getWeather: getWeather,
};
