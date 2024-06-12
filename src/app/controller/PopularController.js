const { KulineryDB } = require("../database/KulineryDB")

const PopularController = {
    async topRecipes(req, res) {
        try {
            const db = KulineryDB.getConnection()
            const recipes = db.collection("recipes")
            const popularRecipes = recipes.aggregate([
                {
                    $lookup: {
                        from: "recipe_likes",
                        localField: "_id",
                        foreignField: "id_recipe",
                        as: "likes"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        likeCount: { $sum: { $size: "$likes" } },
                        slug: { $first: "$slug" },
                        title: { $first: "$title" },
                        thumbnail: { $first: "$thumbnail" },
                        duration: { $first: "$duration" },
                        difficulty: { $first: "$difficulty" },
                        calories: { $first: "$calories" }
                    }
                },
                {
                    $sort: { likeCount: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        _id: 0,
                        slug: 1,
                        title: 1,
                        thumbnail: 1,
                        duration: 1,
                        difficulty: 1,
                        calories: 1,
                        likes: "$likeCount"
                    }
                }
            ]); const popularRecipesArr = await popularRecipes.toArray();
            res.status(200).json({
                method: req.method,
                status: true,
                results: popularRecipesArr
            });
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan resep populer."
                }
            });
        }
    },

    async topArticles(req, res) {
        try {
            const db = KulineryDB.getConnection()
            const articles = db.collection("articles")
            const popularArticles = articles.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        authorName: {
                            $cond: {
                                if: { $gt: [{ $ifNull: ["$user.name", null] }, null] },
                                then: "$user.name",
                                else: {
                                    $cond: {
                                        if: { $gt: [{ $ifNull: ["$author", null] }, null] },
                                        then: "$author",
                                        else: "anonymous"
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "article_likes",
                        localField: "_id",
                        foreignField: "id_article",
                        as: "likes"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        likeCount: { $sum: { $size: "$likes" } },
                        slug: { $first: "$slug" },
                        title: { $first: "$title" },
                        thumbnail: { $first: "$thumbnail" },
                        category: { $first: "$category" },
                        author: { $first: "$authorName" }
                    }
                },
                {
                    $sort: { likeCount: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        _id: 0,
                        slug: 1,
                        title: 1,
                        thumbnail: 1,
                        category: 1,
                        author: 1,
                        likes: "$likeCount"
                    }
                }
            ]);

            const popularArticlesArr = await popularArticles.toArray();
            res.status(200).json({
                method: req.method,
                status: true,
                results: popularArticlesArr
            });
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan resep populer."
                }
            });
        }
    }
}

module.exports = { PopularController }