"use strict";

const db = require("../adapters/db"),
    request = require("request-promise"),
    fetch = require("node-fetch"),
    config = require("../helpers/module-config"),
    HTMLparser = require("node-html-parser");

//////////////////
//// ACTIONS /////
//////////////////

const getWeather = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        let weather_config = config.weather;
        request(weather_config)
            .then((data) => {
                data = JSON.parse(data);
                if (data.httpCode === "429") {
                    return reject(data.httpMessage);
                } else {
                    db.drop("weatherDaily")
                        .then(() => {
                            db.insert("weatherDaily", data)
                                .then(() => {
                                    return resolve();
                                })
                                .catch((e) => {
                                    return reject(e);
                                });
                        })
                        .catch((e) => {
                            return reject(e);
                        });
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
};

const getNews = () => {
    return new Promise(async (resolve, reject) => {
        try {
            fetch("https://www.pcgamer.com/uk/")
                .then((data) => data.text())
                .then(async (data) => {
                    db.select("news")
                        .then((articles) => {
                            let pages = [];
                            const page = HTMLparser.parse(data);
                            let links = page.querySelectorAll(
                                ".list-text-links-trending-panel"
                            );
                            links = HTMLparser.parse(links);

                            for (let link in links.childNodes[0].childNodes) {
                                let scrape =
                                    links.childNodes[0].childNodes[
                                        link
                                    ].toString();
                                scrape = HTMLparser.parse(scrape);
                                scrape = scrape.childNodes[0].childNodes;
                                scrape = HTMLparser.parse(scrape);
                                let scraped = scrape.querySelector("a");
                                if (!!scraped && scraped !== undefined) {
                                    pages.push(scraped.toString());
                                }
                            }

                            if (!articles.itemsLength) {
                                db.insert("news", { pages })
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch((e) => {
                                        return reject(e);
                                    });
                            } else {
                                db.drop("news").then(() => {
                                    db.insert("news", { pages })
                                        .then(() => {
                                            return resolve();
                                        })
                                        .catch((e) => {
                                            return reject(e);
                                        });
                                });
                            }
                        })
                        .catch((e) => {
                            return reject(e);
                        });
                });
        } catch (e) {
            return reject(e);
        }
    });
};

//////////////////
//// HANDLER /////
//////////////////

const getSync = (req, res) => {
    try {
        console.debug(`${new Date()}: Attempting to sync...`);
        console.debug(`${new Date()}: Syncing Weather...`);
        getWeather()
            .then(() => {
                console.debug(`${new Date()}: Syncing Weather Completed.`);
                console.debug(`${new Date()}: Syncing News...`);
                getNews()
                    .then(() => {
                        console.debug(`${new Date()}: Syncing News Completed.`);
                        return res.json({ message: "Sync Successful." });
                    })
                    .catch((e) => {
                        return res.status(502).json({ message: e.toString() });
                    });
            })
            .catch((e) => {
                return res.status(502).json({ message: e.toString() });
            });
    } catch (e) {
        return res.status(502).json({ message: e.toString() });
    }
};

module.exports = {
    getSync: getSync,
};
