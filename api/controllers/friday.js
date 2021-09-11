"use strict";

const db = require("../adapters/db"),
    ObjectId = require("mongodb").ObjectID;

//////////////////
//// ACTIONS /////
//////////////////

const listFriday = async (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            if (req.swagger.params.action.value === "today") {
                db.select("friday", { date: new Date().toLocaleDateString() })
                    .then((data) => {
                        return resolve(data);
                    })
                    .catch((e) => {
                        return reject(e);
                    });
            } else {
                db.select("friday")
                    .then((data) => {
                        return resolve(data);
                    })
                    .catch((e) => {
                        return reject(e);
                    });
            }
        } catch (e) {
            return reject(e);
        }
    });
};

const cleanFriday = async (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            switch (req.swagger.params.action.value) {
                case "today":
                    db.delete("friday", {
                        date: new Date().toLocaleDateString(),
                    })
                        .then((data) => {
                            return resolve({
                                message: "Removed Friday - Today",
                            });
                        })
                        .catch((e) => {
                            return reject(e);
                        });
                    break;
                case "all":
                    db.deleteMany("friday", {})
                        .then((data) => {
                            return resolve({ message: "Removed Friday - All" });
                        })
                        .catch((e) => {
                            return reject(e);
                        });
                    break;
                default:
                    return reject({ message: "No valid point" });
            }
        } catch (e) {
            return reject(e);
        }
    });
};

const editFriday = async (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            let insert = {
                date: new Date().toLocaleDateString(),
                win: 0,
                loss: 0,
            };

            insert[req.swagger.params.type.value] =
                insert[req.swagger.params.type.value] + 1;

            db.select("friday", { date: new Date().toLocaleDateString() })
                .then((data) => {
                    if (data.itemsLength > 0) {
                        insert = {
                            date: new Date().toLocaleDateString(),
                            win: data.items.win,
                            loss: data.items.loss,
                        };

                        switch (req.swagger.params.action.value) {
                            case "add":
                                switch (req.swagger.params.type.value) {
                                    case "win":
                                        insert.win = insert.win + 1;
                                        break;
                                    case "loss":
                                        insert.loss = insert.loss + 1;
                                        break;
                                }
                                break;
                            case "remove":
                                switch (req.swagger.params.type.value) {
                                    case "win":
                                        insert.win = insert.win - 1;
                                        break;
                                    case "loss":
                                        insert.loss = insert.loss - 1;
                                        break;
                                }
                                break;
                            default:
                                throw "No valid switch case.";
                        }

                        db.replace("friday", insert, {
                            _id: ObjectId(data.items._id),
                        })
                            .then((data) => {
                                return resolve({ message: "Updated Friday." });
                            })
                            .catch((e) => {
                                return reject(e);
                            });
                    } else {
                        db.insert("friday", insert)
                            .then((data) => {
                                return resolve({
                                    message: "Added date to Friday.",
                                });
                            })
                            .catch((e) => {
                                return reject(e);
                            });
                    }
                })
                .catch((e) => {
                    return reject(e);
                });
        } catch (e) {
            return reject(e);
        }
    });
};

//////////////////
//// HANDLER /////
//////////////////

const getFriday = (req, res) => {
    listFriday(req, res)
        .then((data) => {
            return res.json(data);
        })
        .catch((e) => {
            return res.status(400).json({
                message: "Couldn't find Friday",
                debug: e.toString(),
            });
        });
};

const deleteFriday = (req, res) => {
    cleanFriday(req, res)
        .then((data) => {
            return res.json(data);
        })
        .catch((e) => {
            return res.status(400).json({
                message: "Couldn't delete Friday",
                debug: e.toString(),
            });
        });
};

const patchFriday = (req, res) => {
    editFriday(req, res)
        .then((data) => {
            return res.json(data);
        })
        .catch((e) => {
            return res.status(400).json({
                message: "Couldn't update Friday",
                debug: e.toString(),
            });
        });
};

module.exports = {
    getFriday: getFriday,
    deleteFriday: deleteFriday,
    patchFriday: patchFriday,
};
