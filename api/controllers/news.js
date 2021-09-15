const db = require("../helpers/db-helper");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const listNews = async (req, res) => {
    try {
        return res.json(
            await db.select("news").then((response) => {
                const data = response;
                data.items = response.items.pages;
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

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getNews = (req, res) => listNews(req, res);

module.exports = {
    getNews,
};
