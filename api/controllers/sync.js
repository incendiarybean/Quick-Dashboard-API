// const HTMLparser = require("node-html-parser");
const { JSDOM } = require("jsdom");
const axios = require("axios");
const db = require("../helpers/db-helper");
// const config = require("../helpers/module-config");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

// const getWeather = async () =>
//     new Promise((resolve, reject) => {
//         const weatherConfig = config.weather;
//         const weatherUrl = new URL(
//             `${weatherConfig.url}?${new URLSearchParams(
//                 weatherConfig.qs
//             ).toString()}`
//         ).toString();

//         axios
//             .get(weatherUrl, { headers: weatherConfig.headers })
//             .then((response) => {
//                 if (response.status === "429") {
//                     return reject(response.httpMessage);
//                 }
//                 return db
//                     .drop("weatherDaily")
//                     .then(() => {
//                         db.insert("weatherDaily", response.data)
//                             .then(() => resolve())
//                             .catch((e) => reject(e));
//                     })
//                     .catch((e) => reject(e));
//             })
//             .catch((e) => reject(e));
//     });

const getPCNews = () =>
    new Promise((resolve, reject) => {
        try {
            return axios
                .get("https://www.pcgamer.com/uk/", { responseType: "text" })
                .then(async (response) =>
                    db
                        .select("news")
                        .then((currentArticles) => {
                            const { document } = new JSDOM(response.data)
                                .window;
                            const newArticles = [];
                            const uneditedArticles = [];
                            Array.prototype.slice
                                .call(
                                    document.querySelectorAll(
                                        ".list-text-links-trending-panel"
                                    )
                                )
                                .map((container) =>
                                    Array.prototype.slice
                                        .call(
                                            container.querySelectorAll(
                                                ".listingResult"
                                            )
                                        )
                                        .map((article) => {
                                            if (
                                                article.parentNode.classList.contains(
                                                    "hidemobile"
                                                )
                                            )
                                                return null;
                                            return uneditedArticles.push(
                                                article
                                            );
                                        })
                                );
                            console.log(uneditedArticles.length);
                            uneditedArticles.forEach((HTMLDivElement) => {
                                const articleDetails = {
                                    title: HTMLDivElement.querySelector(
                                        ".article-name"
                                    ).textContent,
                                    link: HTMLDivElement.querySelector("a")
                                        .href,
                                    img: HTMLDivElement.querySelector(
                                        ".article-lead-image-wrap"
                                    ).getAttribute("data-original"),
                                    date: HTMLDivElement.querySelector(
                                        ".published-date"
                                    ).getAttribute("datetime"),
                                    site: HTMLDivElement.querySelector(
                                        "a"
                                    ).href.split("/")[2],
                                };

                                newArticles.push(articleDetails);
                            });

                            if (!currentArticles.itemsLength) {
                                return db
                                    .insert("news", { pages: newArticles })
                                    .then(() => resolve())
                                    .catch((e) => reject(e));
                            }
                            return db.drop("news").then(() => {
                                db.insert("news", { pages: newArticles })
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

const getNews = () =>
    new Promise((resolve) => {
        getPCNews()
            .then((data) => {
                resolve(data);
            })
            .catch(() => getPCNews());
    });

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getSync = (req, res) => {
    try {
        console.debug(`${new Date()}: Attempting to sync...`);
        console.debug(`${new Date()}: Syncing Weather...`);
        // return getWeather()
        //     .then(() => {
        console.debug(`${new Date()}: Syncing Weather Completed.`);
        console.debug(`${new Date()}: Syncing News...`);
        return getNews()
            .then(() => {
                console.debug(`${new Date()}: Syncing News Completed.`);
                return res.json({ message: "Sync Successful." });
            })
            .catch((e) => res.status(502).json({ message: e.toString() }));
        // })
        // .catch((e) => {
        //     console.log(e);

        //     return res.status(502).json({ message: e.toString() });
        // });
    } catch (e) {
        console.log(e);
        return res.status(502).json({ message: e.toString() });
    }
};

module.exports = {
    getSync,
};
