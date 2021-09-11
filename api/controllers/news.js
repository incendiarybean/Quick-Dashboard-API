"use strict";

const db = require("../adapters/db");

//////////////////
//// ACTIONS /////
//////////////////

const listNews = async (req, res) => {
    try {
        return res.json(
            await db.select("news").then((data) => {
                data.items = data.items.pages;
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

const getNews = (req, res) => {
    return listNews(req, res);
};

module.exports = {
    getNews: getNews,
};
