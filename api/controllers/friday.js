const { ObjectId } = require("mongodb");
const db = require("../helpers/db-helper");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const listFriday = async (req) =>
    new Promise((resolve, reject) => {
        try {
            if (req.params.action === "today") {
                return db
                    .select("friday", { date: new Date().toLocaleDateString() })
                    .then((data) => resolve(data))
                    .catch((e) => reject(e));
            }
            return db
                .select("friday")
                .then((data) => resolve(data))
                .catch((e) => reject(e));
        } catch (e) {
            return reject(e);
        }
    });

const cleanFriday = async (req) =>
    new Promise((resolve, reject) => {
        try {
            switch (req.params.action) {
                case "today":
                    return db
                        .delete("friday", {
                            date: new Date().toLocaleDateString(),
                        })
                        .then(() =>
                            resolve({
                                message: "Removed Friday - Today",
                            })
                        )
                        .catch((e) => reject(e));
                case "all":
                    return db
                        .deleteMany("friday", {})
                        .then(() =>
                            resolve({ message: "Removed Friday - All" })
                        )
                        .catch((e) => reject(e));
                default:
                    throw new Error("No valid point.");
            }
        } catch (e) {
            return reject(e);
        }
    });

const editFriday = async (req) =>
    new Promise((resolve, reject) => {
        try {
            const insert = {
                date: new Date().toLocaleDateString(),
                win: 0,
                loss: 0,
            };

            insert[req.params.type] += 1;

            return db
                .select("friday", { date: new Date().toLocaleDateString() })
                .then((fridayResponse) => {
                    if (fridayResponse.itemsLength > 0) {
                        insert.date = new Date().toLocaleDateString();
                        insert.win = fridayResponse.items.win;
                        insert.loss = fridayResponse.items.loss;

                        switch (req.params.action) {
                            case "add":
                                if (req.params.type === "win") {
                                    insert.win += 1;
                                } else {
                                    insert.loss += 1;
                                }
                                break;
                            case "remove":
                                if (req.params.type === "win") {
                                    insert.win -= 1;
                                } else {
                                    insert.loss -= 1;
                                }
                                break;
                            default:
                                throw new Error("No valid switch case.");
                        }

                        db.replace("friday", insert, {
                            _id: ObjectId(fridayResponse.items._id),
                        })
                            .then(() => resolve({ message: "Updated Friday." }))
                            .catch((e) => reject(e));
                    } else {
                        db.insert("friday", insert)
                            .then(() =>
                                resolve({
                                    message: "Added date to Friday.",
                                })
                            )
                            .catch((e) => reject(e));
                    }
                })
                .catch((e) => reject(e));
        } catch (e) {
            return reject(e);
        }
    });

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getFriday = (req, res) => {
    listFriday(req, res)
        .then((data) => res.json(data))
        .catch((e) =>
            res.status(400).json({
                message: "Couldn't find Friday",
                debug: e.toString(),
            })
        );
};

const deleteFriday = (req, res) => {
    cleanFriday(req, res)
        .then((data) => res.json(data))
        .catch((e) =>
            res.status(400).json({
                message: "Couldn't delete Friday",
                debug: e.toString(),
            })
        );
};

const patchFriday = (req, res) => {
    editFriday(req, res)
        .then((data) => res.json(data))
        .catch((e) =>
            res.status(400).json({
                message: "Couldn't update Friday",
                debug: e.toString(),
            })
        );
};

module.exports = {
    getFriday,
    deleteFriday,
    patchFriday,
};
