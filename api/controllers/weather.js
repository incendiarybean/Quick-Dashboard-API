const db = require("../helpers/db-helper");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const listWeather = async (req, res) => {
    try {
        return res.json(
            await db.select("weatherDaily").then((weatherResponse) => {
                const data = weatherResponse;
                const [items] = weatherResponse.items;
                const { features } = weatherResponse.items[0];

                data.items = items;
                data.location = features[0].properties.location.name;
                data.days = features[0].properties.timeSeries;

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

const getWeather = (req, res) => listWeather(req, res);

module.exports = {
    getWeather,
};
