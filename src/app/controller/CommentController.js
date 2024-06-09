const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const moment = require("moment")
const { ObjectId } = require("mongodb")

const CommentController = {
    postArticleComment: function (req, res) {
        const { msg } = req.body
        const currentDate = moment(new Date()).toISOString();
        const id_article = req.params.id_article

        KulineryDB.insertData({
            table_name: "article_comments",
            data: {
                id_article: ObjectId.createFromHexString(id_article),
                id_user: req.user._id,
                msg: sanitizeReq(msg),
                datePosted: currentDate
            }
        }).then((feedback) => {
            res.status(201).json({ message: feedback });
        }).catch((err) => {
            res.status(500).json({ error: 'Internal server error' });
        });
    },
    postRecipeComment: function (req, res) {
        const { msg } = req.body
        const currentDate = moment(new Date()).toISOString();
        const id_recipe = req.params.id_recipe

        KulineryDB.insertData({
            table_name: "recipe_comments",
            data: {
                id_recipe: ObjectId.createFromHexString(id_recipe),
                id_user: req.user._id,
                msg: sanitizeReq(msg),
                datePosted: currentDate
            }
        }).then((feedback) => {
            res.status(201).json({ message: feedback });
        }).catch((err) => {
            res.status(500).json({ error: 'Internal server error' });
        });
    },
    getRecipeComments: async (req, res) => {
        const commentPerLoad = 10;
        let { id_recipe, nth_page } = req.params;
        let { sort } = req.query
        sort = sort || "new"
        nth_page = parseInt(nth_page, 10) || 0
        const db = KulineryDB.getConnection();
        const recipe_comments = db.collection("recipe_comments");
        try {
            const collections = await recipe_comments.aggregate([
                {
                    $match: {
                        id_recipe: ObjectId.createFromHexString(id_recipe),
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
                        name: {
                            $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "anonymous"]
                        },
                        profilePicture: { $arrayElemAt: ["$user.profilePicture", 0] },
                    }
                },
                {
                    $sort: {
                        datePosted: sort === "old" ? 1 : -1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        id_recipe: 0,
                        id_user: 0,
                        user: 0,
                    }
                },
                {
                    $skip: commentPerLoad * (nth_page - 1 <= 0 ? 0 : nth_page - 1)
                },
                {
                    $limit: commentPerLoad
                }
            ]).toArray();

            res.status(200).json({
                method: req.method,
                status: collections.length >= 1,
                results: collections,
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
        let { id_article, nth_page } = req.params;
        let { sort } = req.query
        sort = sort || "new"
        nth_page = parseInt(nth_page, 10) || 0
        const db = KulineryDB.getConnection();
        const article_comments = db.collection("article_comments");
        try {
            const collections = await article_comments.aggregate([
                {
                    $match: {
                        id_article: ObjectId.createFromHexString(id_article),
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
                        name: {
                            $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "anonymous"]
                        },
                        profilePicture: { $arrayElemAt: ["$user.profilePicture", 0] },
                    }
                },
                {
                    $sort: {
                        datePosted: sort === "old" ? 1 : -1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        id_article: 0,
                        id_user: 0,
                        user: 0,
                    }
                },
                {
                    $skip: commentPerLoad * (nth_page - 1 <= 0 ? 0 : nth_page - 1)
                },
                {
                    $limit: commentPerLoad
                }
            ]).toArray();

            res.status(200).json({
                method: req.method,
                status: collections.length >= 1,
                results: collections,
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