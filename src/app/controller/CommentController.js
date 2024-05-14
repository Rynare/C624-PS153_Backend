const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")

const CommentController = {
    postComment: function (req, res) {
        const { username, msg } = sanitizeReq(req.body)
        const currentDate = new Date();
        const url = req.params.url

        KulineryDB.insertData({
            table_name: "comments",
            data: {
                url: url,
                username: username,
                msg: msg,
                date: currentDate
            }
        }).then((feedback) => {
            console.log(feedback)
            res.status(200).json({ message: feedback });
        }).catch((err) => {
            console.error('Error inserting comment:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    },
    getComment: async (req, res) => {
        const url = req.params.url
    }
}

module.exports = { CommentController }