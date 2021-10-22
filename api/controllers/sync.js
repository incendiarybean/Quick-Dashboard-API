// const HTMLparser = require("node-html-parser");
const { JSDOM } = require("jsdom");
const axios = require("axios");
const db = require("../helpers/db-helper");
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

const getPCNews = () =>
    new Promise((resolve) =>
        axios
            .get("https://www.pcgamer.com/uk/", { responseType: "text" })
            .then(async (response) => {
                const { document } = new JSDOM(response.data).window;
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
                            .call(container.querySelectorAll(".listingResult"))
                            .map((article, index) => {
                                if (index > 9) return null;
                                return uneditedArticles.push(article);
                            })
                    );

                uneditedArticles.forEach((HTMLDivElement) => {
                    const articleDetails = {
                        title: HTMLDivElement.querySelector(".article-name")
                            .textContent,
                        link: HTMLDivElement.querySelector("a").href,
                        img: HTMLDivElement.querySelector(
                            ".article-lead-image-wrap"
                        ).getAttribute("data-original"),
                        date: new Date(
                            HTMLDivElement.querySelector(
                                ".relative-date"
                            ).getAttribute("datetime")
                        ).toLocaleDateString(),
                        site: HTMLDivElement.querySelector("a").href.split(
                            "/"
                        )[2],
                    };

                    newArticles.push(articleDetails);
                });

                resolve(newArticles);
            })
            .catch(() => {
                console.log(`Failed to get PC News... Retrying.`);
                return getPCNews();
            })
    );

const getUKNews = () =>
    new Promise((resolve) =>
        axios
            .get("https://www.bbc.co.uk/news/england", {
                responseType: "text",
            })
            .then(async (response) => {
                const { document } = new JSDOM(response.data).window;
                const newArticles = [];
                const uneditedArticles = [];

                Array.prototype.slice
                    .call(document.querySelectorAll("#topos-component"))
                    .map((container) =>
                        Array.prototype.slice
                            .call(
                                container.querySelectorAll(
                                    ".gs-c-promo, .gs-t-News"
                                )
                            )
                            .map((article, index) => {
                                if (index > 6 || !article.textContent)
                                    return null;
                                return uneditedArticles.push(article);
                            })
                    );

                uneditedArticles.forEach((HTMLDivElement) => {
                    if (
                        !HTMLDivElement.querySelector(
                            ".gs-c-promo-heading__title"
                        ) ||
                        !HTMLDivElement.querySelector("img") ||
                        !HTMLDivElement.querySelector("time")
                    )
                        return null;

                    let imgUrl =
                        HTMLDivElement.querySelector("img").getAttribute(
                            "data-src"
                        );
                    if (imgUrl) {
                        imgUrl = imgUrl.replace(/\{width}/g, "720");
                    } else {
                        imgUrl =
                            HTMLDivElement.querySelector("img").src || null;
                    }

                    const articleDetails = {
                        title: HTMLDivElement.querySelector(
                            ".gs-c-promo-heading__title"
                        ).textContent,
                        link: `https://bbc.co.uk${
                            HTMLDivElement.querySelector("a").href
                        }`,
                        img: imgUrl,
                        date: new Date(
                            HTMLDivElement.querySelector("time").getAttribute(
                                "datetime"
                            )
                        ).toLocaleDateString(),
                        site: HTMLDivElement.querySelector("a").href.split(
                            "/"
                        )[2],
                    };

                    return newArticles.push(articleDetails);
                });
                return resolve(newArticles);
            })
            .catch(() => {
                console.log(`Failed to get UK News... Retrying.`);
                return getUKNews();
            })
    );

const getNasaImage = () =>
    new Promise((resolve) => {
        axios
            .get(
                `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
            )
            .then((response) => resolve(response.data))
            .catch(() => {
                console.log(`Failed to get PC News... Retrying.`);
                return getNasaImage();
            });
    });

const getNews = () =>
    new Promise((resolve, reject) => {
        db.select("news").then(async (currentArticles) => {
            const gamingData = await getPCNews();
            const newsData = await getUKNews();
            const nasaData = await getNasaImage();
            if (!currentArticles.itemsLength) {
                return db
                    .insert("news", {
                        pages: {
                            gaming: gamingData,
                            news: newsData,
                            nasa: nasaData,
                        },
                    })
                    .then(() => resolve())
                    .catch((e) => reject(e));
            }
            return db.drop("news").then(() => {
                db.insert("news", {
                    pages: {
                        gaming: gamingData,
                        news: newsData,
                        nasa: nasaData,
                    },
                })
                    .then(() => resolve())
                    .catch((e) => reject(e));
            });
        });
    });

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getSync = (req, res) => {
    try {
        console.debug(`${new Date()}: Attempting to sync...`);
        console.debug(`${new Date()}: Syncing News...`);
        return getNews()
            .then(() => {
                console.debug(`${new Date()}: Syncing News Completed.`);
                if (process.env.NODE_ENV === "development")
                    return res.json({ message: "Sync Successful." });
                console.debug(`${new Date()}: Syncing Weather...`);
                return getWeather()
                    .then(() => {
                        console.debug(
                            `${new Date()}: Syncing Weather Completed.`
                        );
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
