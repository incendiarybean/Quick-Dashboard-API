const { MongoClient } = require("mongodb");
const { mongoDB } = require("./module-config");

const uri = `mongodb://${mongoDB.username}:${mongoDB.password}@${mongoDB.host}${mongoDB.port}`;
module.exports = {
    connect: () =>
        new Promise((resolve, reject) => {
            try {
                MongoClient.connect(
                    uri,
                    {
                        useUnifiedTopology: true,
                        useNewUrlParser: true,
                    },
                    (err, client) => {
                        if (err)
                            return reject(
                                new Error({ code: 401, message: err })
                            );
                        const db = client.db("intranet");
                        return resolve({ db, client });
                    }
                );
            } catch (e) {
                console.log(e);
            }
        }).catch((e) => {
            console.log(e);
        }),
    insert: (collection, data) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .insertOne(data, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ res, id: data._id });
                    });
            });
        }),
    delete: (collection, filter) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .deleteOne(filter, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        }),
    deleteMany: (collection, filter) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .deleteMany(filter, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        }),
    drop: async (collection) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db.collection(collection).drop((err) => {
                    if (err) return reject(err);
                    return resolve({ message: "Dropped collection" });
                });
            });
        }),
    update: (collection, update, filter) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .updateOne(filter, update, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        }),
    replace: (collection, update, filter) =>
        new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .replaceOne(filter, update, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        }),
    select: (collection, parameters) => {
        const params = parameters || {};
        return new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .find(params)
                    .toArray((err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({
                            message: "Success",
                            itemsLength: res.length,
                            items: res,
                        });
                    });
            });
        });
    },
    selectOne: (collection, parameters) => {
        const params = parameters || {};
        return new Promise((resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .findOne(params, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        });
    },
};
