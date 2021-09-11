module.exports = {
    weather: {
        method: "GET",
        url: "https://api-metoffice.apiconnect.ibmcloud.com/metoffice/production/v0/forecasts/point/daily",
        qs: {
            includeLocationName: true,
            latitude: process.env.LATITUDE,
            longitude: process.env.LONGITUDE,
        },
        headers: {
            "x-ibm-client-id": process.env.MET_CLIENT_ID,
            "x-ibm-client-secret": process.env.MET_API_SECRET,
            accept: "application/json",
        },
    },
    googleOptions: {
        apiKey: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_CX,
        num: "10",
    },
    MAC: process.env.MAC,
    mongoDB: {
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PASS,
        host: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
    },
};
