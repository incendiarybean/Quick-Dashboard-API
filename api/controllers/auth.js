const db = require("../adapters/db");

/*--------------*/
/*   ACTIONS    */
/*--------------*/

const Login = async (req, res) => {
    try {
        return db
            .selectOne("users", {
                username: req.body.username,
            })
            .then((data) => {
                if (
                    !data.item ||
                    data.item.password !== req.body.password ||
                    !req.body.password
                ) {
                    return res.json({
                        message: "Username or Password incorrect.",
                    });
                }
                return res.json({
                    message: "Validated Successfully.",
                    user: {
                        username: data.item.username,
                        firstname: data.item.firstname,
                        surname: data.item.surname,
                        email: data.item.email,
                    },
                });
            });
    } catch (e) {
        return res.status(400).json({
            message: `Cannot complete action: ${req.method} on ${req.path}`,
            debug: e.toString(),
        });
    }
};

const SignUp = async (req, res) => {
    try {
        if (
            !req.body.username ||
            !req.body.password ||
            !req.body.firstname ||
            !req.body.surname ||
            !req.body.email
        ) {
            return res.status(422).json({
                message: "You're please ensure to fill out the form!",
            });
        }

        return db
            .select("users", { username: req.body.username })
            .then((usersResponse) => {
                if (usersResponse.itemsLength !== 0) {
                    return res
                        .status(403)
                        .json({ message: "Username is already taken." });
                }
                return db
                    .insert("users", {
                        username: req.body.username,
                        password: req.body.password,
                        firstname: req.body.firstname,
                        surname: req.body.surname,
                        email: req.body.email,
                    })
                    .then((userResponse) => {
                        if (!userResponse.id) {
                            return res.status(502).json({
                                message: "Couldn't create a user account.",
                            });
                        }
                        return res.json({
                            message: "Account created successfully.",
                        });
                    });
            });
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

const loginRequest = (req, res) => Login(req, res);

const newUser = (req, res) => SignUp(req, res);

module.exports = {
    loginRequest,
    newUser,
};
