const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const moment = require("moment")

const CommentController = {
    postArticleComment: function (req, res) {
        const { msg } = req.body
        const currentDate = moment(new Date()).toISOString();
        const id_article = req.params.id_article

        KulineryDB.insertData({
            table_name: "comments",
            data: {
                id_article,
                id_user: req.user._id,
                msg:sanitizeReq(msg),
                date: currentDate
            }
        }).then((feedback) => {
            console.log(feedback)
            res.status(201).json({ message: feedback });
        }).catch((err) => {
            console.error('Error inserting comment:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    },
    postRecipeComment: function (req, res) {
        const { msg } = req.body
        const currentDate = moment(new Date()).toISOString();
        const id_recipe = req.params.id_recipe

        KulineryDB.insertData({
            table_name: "comments",
            data: {
                id_recipe,
                id_user: req.user._id,
                msg: sanitizeReq(msg),
                date: currentDate
            }
        }).then((feedback) => {
            console.log(feedback)
            res.status(201).json({ message: feedback });
        }).catch((err) => {
            console.error('Error inserting comment:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    },
    getRecipeComments: async (req, res) => {
        const commentPerLoad = 10;
    const { id_recipe, nth_page } = req.params;
    const db = KulineryDB.getConnection();
    const recipe_comments = db.collection("recipe_comments");

    try {
        const collections = await recipe_comments.aggregate([
            {
                $match: {
                    id_recipe: id_recipe,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $addFields: {
                    user_name: {
                        $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "anonymous"]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: "$user_name",
                    datePosted: 1,
                    msg: 1,
                }
            },
            {
                $skip: commentPerLoad * nth_page 
            },
            {
                $limit: commentPerLoad 
            }
        ]).toArray();

        res.status(200).json({
            method: req.method,
            status: collections.length >= 1,
            results: collections
        });
    } catch (error) {
        res.status(500).json({
            method: req.method,
            status: false,
            error: error.message
        });
    }
    },
    getArticleComments: async (req, res) => {
    const commentPerLoad = 10;
    const { id_article, nth_page } = req.params;
    const db = KulineryDB.getConnection();
    const article_comments = db.collection("article_comments");

    try {
        const collections = await article_comments.aggregate([
            {
                $match: {
                    id_article: id_article,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $addFields: {
                    user_name: {
                        $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "anonymous"]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: "$user_name",
                    datePosted: 1,
                    msg: 1,
                }
            },
            {
                $skip: commentPerLoad * nth_page 
            },
            {
                $limit: commentPerLoad 
            }
        ]).toArray();

        res.status(200).json({
            method: req.method,
            status: collections.length >= 1,
            results: collections
        });
    } catch (error) {
        res.status(500).json({
            method: req.method,
            status: false,
            error: error.message
        });
    }
}
}

module.exports = { CommentController }