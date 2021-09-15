const { ObjectId } = require("mongodb");
const db = require("../adapters/db");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

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
        return db
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
                req.params.id = data.id;
                listSticky(req, res);
            });
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

const checkSticky = (req) =>
    new Promise((resolve, reject) => {
        let id;
        try {
            id = ObjectId(req.params.id);
        } catch (e) {
            return reject(new Error({ code: 422, message: "Not a valid ID." }));
        }

        const findValidItem = async () => {
            db.selectOne("sticky", {
                _id: id,
            })
                .then((data) => {
                    if (!data.item)
                        return reject(
                            new Error({
                                code: 404,
                                message: "No item for this ID.",
                            })
                        );
                    return resolve(data);
                })
                .catch(() =>
                    reject(
                        new Error({
                            code: 400,
                            message: "Couldn't search for ID.",
                        })
                    )
                );
        };

        return findValidItem();
    });

/*--------------*/
/*    HANDLER   */
/*--------------*/

const getStickies = (req, res) => listStickies(req, res);

const getSticky = (req, res) => {
    checkSticky(req)
        .then(() => listSticky(req, res))
        .catch((e) => res.status(e.code).json({ message: e.message }));
};

const postSticky = (req, res) => addSticky(req, res);

const patchSticky = (req, res) => {
    checkSticky(req)
        .then(() => editSticky(req, res))
        .catch((e) => res.status(e.code).json({ message: e.message }));
};

const deleteSticky = (req, res) => {
    checkSticky(req)
        .then(() => delSticky(req, res))
        .catch((e) => res.status(e.code).json({ message: e.message }));
};

module.exports = {
    getSticky,
    getStickies,
    postSticky,
    patchSticky,
    deleteSticky,
};
