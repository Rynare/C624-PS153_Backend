const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { KulineryDB } = require("../database/KulineryDB")

const AuthController = {
    postNewUser: async (req, res) => {
        const { uid, email, name } = req.body
        const newUser = await KulineryDB.insertData({
            table_name: "users",
            data: {
                uid: sanitizeReq(uid),
                email: sanitizeReq(email),
                name: sanitizeReq(name),
            }
        })
        res.status(201).json({
            method: req.method,
            message: "User berhasil terdaftar.",
            details: newUser
        })
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