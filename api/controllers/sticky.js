"use strict";

const db = require("../adapters/db"),
    ObjectId = require("mongodb").ObjectId;

//////////////////
//// ACTIONS /////
//////////////////

const listStickies = async (req, res) => {
    try {
        return res.json(await db.select("sticky"));
    } catch (e) {
        return res.status(400).json({ message: "Unable to list Sticky Notes" });
    }
};

const listSticky = async (req, res) => {
    try {
        return res.json(
            await db.selectOne("sticky", {
                _id: ObjectId(req.params.id),
            })
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: `${e}`,
        });
    }
};

const editSticky = async (req, res) => {
    try {
        return res.json(
            await db.replace(
                "sticky",
                {
                    top: req.body.top,
                    left: req.body.left,
                    title: req.body.title,
                    content: req.body.content,
                    color: req.body.color,
                    showColor: "hidden",
                    author: req.body.author,
                    lastModified: new Date().toISOString(),
                    notification: req.body.notification
                        ? req.body.notification
                        : null,
                },
                {
                    _id: ObjectId(req.params.id),
                }
            )
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

const delSticky = async (req, res) => {
    try {
        return res.json(
            await db.delete("sticky", {
                _id: ObjectId(req.params.id),
            })
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

const addSticky = async (req, res) => {
    try {
        return res.json(
            await db
                .insert("sticky", {
                    dateTime: new Date(),
                    top: 100,
                    left: 100,
                    title: "",
                    content: "",
                    color: "blue",
                    showColor: "hidden",
                    author: req.body.author,
                    lastModified: new Date().toISOString(),
                })
                .then((data) => {
                    return {
                        message: "Success",
                        item: data.res.ops[0],
                    };
                })
        );
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

const checkSticky = (req) => {
    return new Promise((resolve, reject) => {
        let id;
        try {
            id = ObjectId(req.params.id);
        } catch (e) {
            return reject({ code: 422, message: "Not a valid ID." });
        }

        const findValidItem = async () => {
            db.selectOne("sticky", {
                _id: id,
            })
                .then((data) => {
                    if (!data.item)
                        return reject({
                            code: 404,
                            message: "No item for this ID.",
                        });
                    return resolve(data);
                })
                .catch((e) => {
                    return reject({
                        code: 400,
                        message: "Couldn't search for ID.",
                    });
                });
        };

        findValidItem();
    });
};

//////////////////
//// HANDLER /////
//////////////////

const getStickies = (req, res) => {
    return listStickies(req, res);
};

const getSticky = (req, res) => {
    checkSticky(req)
        .then((data) => {
            return listSticky(req, res);
        })
        .catch((e) => {
            return res.status(e.code).json({ message: e.message });
        });
};

const postSticky = (req, res) => {
    return addSticky(req, res);
};

const patchSticky = (req, res) => {
    checkSticky(req)
        .then((data) => {
            return editSticky(req, res);
        })
        .catch((e) => {
            return res.status(e.code).json({ message: e.message });
        });
};

const deleteSticky = (req, res) => {
    checkSticky(req)
        .then((data) => {
            return delSticky(req, res);
        })
        .catch((e) => {
            return res.status(e.code).json({ message: e.message });
        });
};

module.exports = {
    getSticky: getSticky,
    getStickies: getStickies,
    postSticky: postSticky,
    patchSticky: patchSticky,
    deleteSticky: deleteSticky,
};
