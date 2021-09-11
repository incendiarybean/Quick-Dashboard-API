const MongoClient = require("mongodb").MongoClient,
    mongoDB = require("../helpers/module-config").mongoDB;

const uri = `mongodb://${mongoDB.username}:${mongoDB.password}@${mongoDB.host}${mongoDB.port}`;
module.exports = {
    connect: () => {
        return new Promise((resolve, reject) => {
            try {
                MongoClient.connect(
                    uri,
                    {
                        useUnifiedTopology: true,
                        useNewUrlParser: true,
                    },
                    function (err, client) {
                        if (err) return reject({ code: 401, message: err });
                        var db = client.db("intranet");
                        return resolve({ db, client });
                    }
                );
            } catch (e) {
                console.log(e);
            }
        }).catch((e) => {
            console.log(e);
        });
    },
    insert: (collection, data) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .insertOne(data, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ res, id: data._id });
                    });
            });
        });
    },
    delete: (collection, filter) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .deleteOne(filter, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        });
    },
    deleteMany: (collection, filter) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .deleteMany(filter, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        });
    },
    drop: async (collection) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db.collection(collection).drop((err, res) => {
                    if (err) return reject(err);
                    return resolve({ message: "Dropped collection" });
                });
            });
        });
    },
    update: (collection, update, filter) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .updateOne(filter, update, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        });
    },
    replace: (collection, update, filter) => {
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .replaceOne(filter, update, (err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        return resolve({ message: "Success", item: res });
                    });
            });
        });
    },
    select: (collection, params) => {
        if (!params) params = {};
        return new Promise(async (resolve, reject) => {
            module.exports.connect().then((connection) => {
                connection.db
                    .collection(collection)
                    .find(params)
                    .toArray((err, res) => {
                        if (err) return reject(err);
                        connection.client.close();
                        if (res.length > 1) {
                            return resolve({
                                message: "Success",
                                itemsLength: res.length,
                                items: res,
                            });
                        } else {
                            return resolve({
                                message: "Success",
                                itemsLength: res.length,
                                items: res[0],
                            });
                        }
                    });
            });
        });
    },
    selectOne: (collection, params) => {
        if (!params) params = {};
        return new Promise(async (resolve, reject) => {
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
