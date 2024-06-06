const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { KulineryDB } = require("../database/KulineryDB")

const AuthController = {
    postNewUser: async (req, res) => {
        const { uid, email, name, profilePicture } = req.body;

        try {
            const existingUser = await KulineryDB.findData({
                table_name: "users",
                filter: { email: sanitizeReq(email) }
            });

            let response;
            if (existingUser) {
                response = await KulineryDB.updateData({
                    table_name: "users",
                    filter: { email: sanitizeReq(email) },
                    updateDoc: {
                        $set: {
                            uid: sanitizeReq(uid),
                        }
                    }
                });

                res.status(200).json({
                    method: req.method,
                    message: `Welcome back ${name}.`,
                    details: {
                        id: existingUser._id,
                        uid, email, name, profilePicture
                    }
                });
            } else {
                response = await KulineryDB.insertData({
                    table_name: "users",
                    data: {
                        uid: sanitizeReq(uid),
                        email: sanitizeReq(email),
                        name: sanitizeReq(name),
                        profilePicture: sanitizeReq(profilePicture),
                    }
                });

                res.status(201).json({
                    method: req.method,
                    message: "User berhasil terdaftar.",
                    details: {
                        id: response.insertedId,
                        uid, email, name, profilePicture
                    }
                });
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                message: "Internal server error.",
                error: error.message
            });
        }
    },
    getUser: async (req, res) => {
        const uid = req.params.uid
        const collections = await KulineryDB.findData({
            table_name: "users",
            filter: {
                uid: uid
            }
        })
        res.status(200).json({
            method: req.method,
            status: collections.length >= 1,
            results: collections
        })
    }
}

module.exports = { AuthController }