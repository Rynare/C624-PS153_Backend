const { ObjectId } = require("mongodb")
const { KulineryDB } = require("../database/KulineryDB")

const LikesController = {
    article: async (req, res) => {
        let { id_article } = req.params
        id_article = ObjectId.createFromHexString(id_article)
        const id_user = req.user._id

        async function getLikeCount() {
            try {
                const db = KulineryDB.getConnection();
                const table = db.collection("article_likes");

                const aggregateRaw = table.aggregate([
                    {
                        $match: {
                            id_article: id_article
                        }
                    },
                    {
                        $group: {
                            _id: "$id_article",
                            likeCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            likeCount: 1
                        }
                    }
                ]);

                const result = await aggregateRaw.toArray();

                if (result.length > 0) {
                    return result[0].likeCount;
                } else {
                    return 0;
                }
            } catch (error) {
                console.error('Error fetching like count:', error);
                return 0;
            }
        }

        try {
            const existingLike = await KulineryDB.findData({
                table_name: "article_likes",
                filter: {
                    id_article: id_article,
                    id_user: id_user
                }
            });
            if (existingLike) {
                await KulineryDB.deleteData({
                    table_name: "article_likes",
                    filter: { id_article: id_article, id_user: id_user }
                });
                res.status(200).json({
                    method: req.method,
                    error: false,
                    isLike: false,
                    likeCount: await getLikeCount()
                });
            } else {
                await KulineryDB.insertData({
                    table_name: "article_likes",
                    data: {
                        id_article: id_article,
                        id_user: id_user
                    }
                })
                res.status(201).json({
                    method: req.method,
                    error: false,
                    isLike: true,
                    likeCount: await getLikeCount()
                });
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                method: req.method,
                error: true,
                message: error
            })
        }
    },
    recipe: async (req, res) => {
        let { id_recipe } = req.params
        id_recipe = ObjectId.createFromHexString(id_recipe)
        const id_user = req.user._id

        async function getLikeCount() {
            try {
                const db = KulineryDB.getConnection();
                const table = db.collection("recipe_likes");

                const aggregateRaw = table.aggregate([
                    {
                        $match: {
                            id_recipe: id_recipe
                        }
                    },
                    {
                        $group: {
                            _id: "$id_recipe",
                            likeCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            likeCount: 1
                        }
                    }
                ]);

                const result = await aggregateRaw.toArray();

                if (result.length > 0) {
                    return result[0].likeCount;
                } else {
                    return 0;
                }
            } catch (error) {
                console.error('Error fetching like count:', error);
                return 0;
            }
        }

        try {
            const existingLike = await KulineryDB.findData({
                table_name: "recipe_likes",
                filter: {
                    id_recipe: id_recipe,
                    id_user: id_user
                }
            });
            if (existingLike) {
                await KulineryDB.deleteData({
                    table_name: "recipe_likes",
                    filter: { id_recipe: id_recipe, id_user: id_user }
                });
                res.status(200).json({
                    method: req.method,
                    error: false,
                    isLike: false,
                    likeCount: await getLikeCount()
                });
            } else {
                await KulineryDB.insertData({
                    table_name: "recipe_likes",
                    data: {
                        id_recipe: id_recipe,
                        id_user: id_user
                    }
                })
                res.status(201).json({
                    method: req.method,
                    error: false,
                    isLike: true,
                    likeCount: await getLikeCount()
                });
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                method: req.method,
                error: true,
                message: error
            })
        }
    }
}

module.exports = { LikesController }