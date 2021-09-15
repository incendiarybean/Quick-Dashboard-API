const HTMLparser = require("node-html-parser");
const axios = require("axios");
const db = require("../adapters/db");
const config = require("../helpers/module-config");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const getWeather = async () =>
    new Promise((resolve, reject) => {
        const weatherConfig = config.weather;
        const weatherUrl = new URL(
            `${weatherConfig.url}?${new URLSearchParams(
                weatherConfig.qs
            ).toString()}`
        ).toString();

        axios
            .get(weatherUrl, { headers: weatherConfig.headers })
            .then((response) => {
                if (response.status === "429") {
                    return reject(response.httpMessage);
                }
                return db
                    .drop("weatherDaily")
                    .then(() => {
                        db.insert("weatherDaily", response.data)
                            .then(() => resolve())
                            .catch((e) => reject(e));
                    })
                    .catch((e) => reject(e));
            })
            .catch((e) => reject(e));
    });

const getNews = () =>
    new Promise((resolve, reject) => {
        try {
            return axios
                .get("https://www.pcgamer.com/uk/", { responseType: "text" })
                .then(async (response) =>
                    db
                        .select("news")
                        .then((articles) => {
                            const pages = [];
                            const document = HTMLparser.parse(response.data);
                            const linkParents = HTMLparser.parse(
                                document.querySelector(
                                    ".list-text-links-trending-panel"
                                )
                            );

                            linkParents.childNodes[0].childNodes.forEach(
                                (child) => {
                                    const linkContainer = HTMLparser.parse(
                                        child.toString()
                                    );
                                    const linkChild =
                                        linkContainer.querySelector("a");
                                    if (linkChild && linkChild !== undefined) {
                                        pages.push(linkChild.toString());
                                    }
                                }
                            );

                            if (!articles.itemsLength) {
                                return db
                                    .insert("news", { pages })
                                    .then(() => resolve())
                                    .catch((e) => reject(e));
                            }
                            return db.drop("news").then(() => {
                                db.insert("news", { pages })
                                    .then(() => resolve())
                                    .catch((e) => reject(e));
                            });
                        })
                        .catch((e) => reject(e))
                );
        } catch (e) {
            return reject(e);
        }
    });

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getSync = (req, res) => {
    try {
        console.debug(`${new Date()}: Attempting to sync...`);
        console.debug(`${new Date()}: Syncing Weather...`);
        return getWeather()
            .then(() => {
                console.debug(`${new Date()}: Syncing Weather Completed.`);
                console.debug(`${new Date()}: Syncing News...`);
                return getNews()
                    .then(() => {
                        console.debug(`${new Date()}: Syncing News Completed.`);
                        return res.json({ message: "Sync Successful." });
                    })
                    .catch((e) =>
                        res.status(502).json({ message: e.toString() })
                    );
            })
            .catch((e) => {
                console.log(e);

                return res.status(502).json({ message: e.toString() });
            });
    } catch (e) {
        console.log(e);
        return res.status(502).json({ message: e.toString() });
    }
};

module.exports = {
    getSync,
};
