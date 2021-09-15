const { google } = require("googleapis");
const config = require("../helpers/module-config").googleOptions;

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const listGoogle = async (req, res) => {
    try {
        const customsearch = google.customsearch("v1");

        const search = async (options) => {
            const result = await customsearch.cse.list({
                cx: options.cx,
                q: req.swagger.params.q.value,
                auth: options.apiKey,
                num: options.num,
            });

            if (result.data.status === 429) {
                throw new Error("Couldn't work right now.");
            }

            const gResult = [];
            for (let i = 0; i < result.data.items.length; i += 1) {
                const gRes = result.data.items[i];
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
        };

        const options = config;
        return search(options).catch((e) =>
            res.json({
                _id: null,
                search: "Google API is tired, try later.",
                url: "",
                type: "",
                debug: e.toString(),
            })
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getGoogle = (req, res) => listGoogle(req, res);

module.exports = {
    getGoogle,
};
