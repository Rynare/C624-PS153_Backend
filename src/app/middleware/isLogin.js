const { ObjectId } = require("mongodb");
const { KulineryDB } = require("../database/KulineryDB");

async function isLogin(req, res, next) {
    const { id_user, email, uid } = req.body;

    try {
        const user = await KulineryDB.findDatas({
            table_name: "users",
            filter: {
                _id: ObjectId.createFromHexString(id_user),
                email,
                uid
            }
        });
        if (!user || user.length === 0) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: User not logged in or invalid credentials."
            });
        }

        req.user = user[0];
        next();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = { isLogin }