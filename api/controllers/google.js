"use strict";

//////////////////
//// ACTIONS /////
//////////////////

const listGoogle = async (req, res) => {
    try {
        const { google } = require("googleapis");
        const customsearch = google.customsearch("v1");

        const config = require("../helpers/module-config").googleOptions;
        const options = config;

        const search = async (options) => {
            const result = await customsearch.cse.list({
                cx: options.cx,
                q: req.swagger.params.q.value,
                auth: options.apiKey,
                num: options.num,
            });
            if (result.data.status !== 429) {
                let gResult = [];
                for (let i = 0; i < result.data.items.length; i++) {
                    let gRes = result.data.items[i];
                    if (gRes.pagemap.cse_thumbnail !== undefined) {
                        gResult.push({
                            _id: null,
                            search: encodeURIComponent(gRes.htmlTitle),
                            image: encodeURIComponent(
                                gRes.pagemap.cse_thumbnail[0].src
                            ),
                            type: "search",
                            url: encodeURIComponent(gRes.formattedUrl),
                        });
                    } else {
                        gResult.push({
                            _id: null,
                            search: encodeURIComponent(gRes.htmlTitle),
                            type: "search",
                            url: encodeURIComponent(gRes.formattedUrl),
                        });
                    }
                }
                return res.json(gResult);
            }
        };
        search(options).catch((e) => {
            return res.json({
                _id: null,
                search: "Google API is tired, try later.",
                url: "",
                type: "",
                debug: e.toString(),
            });
        });
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

const getGoogle = (req, res) => {
    return listGoogle(req, res);
};

module.exports = {
    getGoogle: getGoogle,
};
