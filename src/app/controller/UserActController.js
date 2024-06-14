const { KulineryDB } = require("../database/KulineryDB")

const dataPerPage = 12
const UserActController = {
    getRecipeLiked: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }

        try {
            const db = KulineryDB.getConnection()
            const table = db.collection("recipe_likes")
            const recipeLikes = await table.aggregate([
                {
                $match: {
                    id_user: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'recipes',
                    localField: 'id_recipe',
                    foreignField: '_id',
                    as: 'recipeDetails'
                }
            },
            {
                $unwind: '$recipeDetails'
            },
            {
                $lookup: {
                    from: 'recipe_likes',
                    localField: 'id_recipe',
                    foreignField: 'id_recipe',
                    as: 'likeCountDetails'
                }
            },
            {
                $addFields: {
                    likeCount: { $size: '$likeCountDetails' }
                }
            },
            {
                $project: {
                    _id: 0,
                    slug: '$recipeDetails.slug',
                    title: '$recipeDetails.title',
                    thumbnail: '$recipeDetails.thumbnail',
                    duration: '$recipeDetails.duration',
                    difficulty: '$recipeDetails.difficulty',
                    calories: '$recipeDetails.calories',
                    likes: '$likeCount',
                    datePublished: '$recipeDetails.datePublished'
                }
            },
            {
                $sort: {
                    datePublished: -1,
                    title: 1
                }
            },
            {
                $skip: dataPerPage * page
            },
            {
                $limit: dataPerPage
            }
            ]).toArray()
            if (recipeLikes.length >= 1) {
                res.status(200).json({
                    method: req.method,
                    status: true,
                    results: recipeLikes
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    status: false,
                    results: recipeLikes
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Internal server error!",
                    message: "Gagal mendapatkan daftar resep disukai."
                }
            });
        }
    },
    getArticleLiked: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }

        try {
            const db = KulineryDB.getConnection()
            const table = db.collection("article_likes")
            const articleLikes = await table.aggregate([
                 {
        $match: {
            id_user: req.user._id
        }
    },
    {
        $lookup: {
            from: 'articles',
            localField: 'id_article',
            foreignField: '_id',
            as: 'articleDetails'
        }
    },
    {
        $unwind: '$articleDetails'
    },
    {
        $lookup: {
            from: 'users',
            localField: 'articleDetails.id_user', 
            foreignField: '_id',
            as: 'userDetails'
        }
    },
    {
        $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true 
        }
    },
    {
        $lookup: {
            from: 'article_likes',
            localField: 'id_article',
            foreignField: 'id_article',
            as: 'likeCountDetails'
        }
    },
    {
        $addFields: {
            likeCount: { $size: '$likeCountDetails' }
        }
    },
    {
        $addFields: {
            authorName: {
                $cond: {
                    if: { $gt: [{ $ifNull: ["$userDetails.name", null] }, null] },
                    then: "$userDetails.name",
                    else: {
                        $cond: {
                            if: { $gt: [{ $ifNull: ["$articleDetails.author", null] }, null] },
                            then: "$articleDetails.author",
                            else: "anonymous"
                        }
                    }
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            slug: '$articleDetails.slug',
            title: '$articleDetails.title',
            thumbnail: '$articleDetails.thumbnail',
            category: {
                slug: '$articleDetails.category.slug',
                name: '$articleDetails.category.name'
            },
            author: '$authorName',
            likes: '$likeCount'
        }
    },
    {
        $sort: {
            'articleDetails.datePublished': -1,
            'articleDetails.title': 1
        }
    },
    {
        $skip: dataPerPage * page
    },
    {
        $limit: dataPerPage
    }
            ]).toArray()
            if (articleLikes.length >= 1) {
                res.status(200).json({
                    method: req.method,
                    status: true,
                    results: articleLikes
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    status: false,
                    results: articleLikes
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Internal server error!",
                    message: "Gagal mendapatkan daftar artikel disukai."
                }
            });
        }
    }
}

module.exports = {UserActController}