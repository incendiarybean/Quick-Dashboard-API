const db = require("../adapters/db");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const listWeather = async (req, res) => {
    try {
        return res.json(
            await db.select("weatherDaily").then((weatherResponse) => {
                const data = weatherResponse;
                data.location =
                    weatherResponse.items.features[0].properties.location.name;
                data.days =
                    weatherResponse.items.features[0].properties.timeSeries;
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
