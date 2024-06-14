const { ObjectId } = require("mongodb")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")
const moment = require("moment")

const dataPerPage = 12
const tableName = "recipes"

const RecipesController = {
    postRecipe: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                method: req.method,
                status: false,
                message: "File thumbnail harus disertakan."
            });
        }
        const { slug, title, description, duration, calories, ingredients, difficulty, portion, steps, tips, tags, } = req.body
        function clasifyCalories(value) {
            if (value >= 500 && value <= 799) {
                return "medium"
            } else if (value >= 800) {
                return "high"
            }
            return "low"
        }
        const caloriesArr = [
            clasifyCalories(calories),
            calories + "Kkal"
        ]
        const newRecipes = await KulineryDB.insertData({
            table_name: "recipes",
            data: {
                slug,
                title: sanitizeReq(title),
                id_user: req.user._id,
                datePublished: moment().toISOString(),
                description: sanitizeReq(description),
                duration,
                difficulty,
                calories: calories ? caloriesArr : [],
                portion,
                ingredients: ingredients.map(sanitizeReq),
                steps: steps.map(sanitizeReq),
                tips: tips.length >= 1 ? tips.map(sanitizeReq) : [],
                tags: tags.length >= 1 ? tags.map(sanitizeReq) : [],
                thumbnail: req.file.path,
            }
        })
        res.status(201).json({
            method: req.method,
            status: true,
            results: newRecipes
        })
    },

    getRecipes: async (req, res) => {
        try {
            const db = KulineryDB.getConnection()
            const recipes = db.collection(tableName)
            const collections = recipes.aggregate([
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
                    $sort: {
                        datePublished: -1,
                        title: 1
                    }
                },
                {
                    $limit: dataPerPage
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
            ]);

            const collectionsArr = await collections.toArray();
            const collectionTotal = collectionsArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    status: true,
                    pages: totalPages,
                    results: collectionsArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    status: false,
                    pages: totalPages,
                    results: collectionsArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Internal server error!",
                    message: "Gagal mendapatkan daftar resep."
                }
            });
        }
    },

    getRecipesOnPage: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        try {
            const db = KulineryDB.getConnection()
            const recipes = db.collection(tableName)
            const collections = recipes.aggregate([
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
                        calories: { $first: "$calories" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: {
                        datePublished: -1,
                        title: 1
                    }
                },
                {
                    $skip: dataPerPage * page,
                },
                {
                    $limit: dataPerPage,
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
            ]);

            const collectionsArr = await collections.toArray();
            const collectionTotal = collectionsArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    status: true,
                    pages: totalPages,
                    results: collectionsArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    status: false,
                    pages: totalPages,
                    results: collectionsArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Internal server error!",
                    message: "Gagal mendapatkan daftar resep."
                }
            });
        }
    },

    getRecipesBySearch: async (req, res) => {
        const keyword = req.params.keyword
        if (!keyword) {
            return res.status(400).json({
                method: req.method,
                status: false,
                pages: 0,
                results: {
                    error: "Error!",
                    message: "Keyword query parameter is required."
                }
            });
        }

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { desc: { $regex: keyword, $options: 'i' } },
                    { ingredients: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { steps: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { tips: { $elemMatch: { $regex: keyword, $options: 'i' } } }
                ]
            },
            options: {
                limit: dataPerPage,
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    thumbnail: 1,
                    duration: 1,
                    difficulty: 1,
                    calories: 1,
                }
            }
        })

        const collectionTotal = collections.length || 0
        const totalDocs = await KulineryDB.getTotalItem({
            table_name: tableName,
            filter: {
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { desc: { $regex: keyword, $options: 'i' } },
                    { ingredients: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { steps: { $elemMatch: { $regex: keyword, $options: 'i' } } },
                    { tips: { $elemMatch: { $regex: keyword, $options: 'i' } } }
                ]
            },
        }) || 0
        const totalPages = Math.ceil(totalDocs / dataPerPage)

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                pages: totalPages,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                status: false,
                pages: totalPages,
                results: collections
            })
        }
    },

    getRecipesBySearchOnPage: async (req, res) => {
        const keyword = req.params.keyword
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        try {
            const db = KulineryDB.getConnection()
            const recipes = db.collection(tableName)
            const collections = recipes.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: keyword, $options: 'i' } },
                            { description: { $regex: keyword, $options: 'i' } }
                        ]
                    }
                },
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
                        calories: { $first: "$calories" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: {
                        datePublished: -1,
                        title: 1
                    }
                },
                {
                    $skip: dataPerPage * page,
                },
                {
                    $limit: dataPerPage,
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
            ]);

            const collectionsArr = await collections.toArray();
            const collectionTotal = collectionsArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    status: true,
                    pages: totalPages,
                    results: collectionsArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    status: false,
                    pages: totalPages,
                    results: collectionsArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Internal server error!",
                    message: "Gagal mendapatkan daftar resep."
                }
            });
        }
    },

    getRecipesByCategory: async (req, res) => {
        const category_slug = req.params.category_slug

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "category.slug": { $eq: category_slug }
            },
            options: {
                limit: dataPerPage,
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    thumbnail: 1,
                    duration: 1,
                    difficulty: 1,
                    calories: 1,
                }
            }
        })

        const collectionTotal = collections.length || 0
        const totalDocs = await KulineryDB.getTotalItem({
            table_name: tableName,
            filter: {
                "category.slug": { $eq: category_slug }
            },
        }) || 0
        const totalPages = Math.ceil(totalDocs / dataPerPage)

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                pages: totalPages,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                status: false,
                pages: totalPages,
                results: collections
            })
        }
    },

    getRecipesByCategoryOnPage: async (req, res) => {
        const category_slug = req.params.category_slug
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "category.slug": { $eq: category_slug }
            },
            options: {
                limit: dataPerPage,
                skip: page * dataPerPage
            }
        })

        const collectionTotal = collections.length || 0
        const totalDocs = await KulineryDB.getTotalItem({
            table_name: tableName, filter: {
                "category.slug": { $eq: category_slug }
            },
        }) || 0
        const totalPages = Math.ceil(totalDocs / dataPerPage)

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                pages: totalPages,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                status: false,
                pages: totalPages,
                results: collections
            })
        }
    },

    getRecipeDetail: async (req, res) => {
        const { slug } = req.params
        let id_user = req.query.user
        const db = KulineryDB.getConnection()
        const table = db.collection("recipes")
        const recipesAggr = table.aggregate([
            {
                $match: {
                    slug: slug,
                }
            },
            {
                $lookup: {
                    from: "recipe_likes",
                    localField: "_id",
                    foreignField: "id_recipe",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "recipe_comments",
                    localField: "_id",
                    foreignField: "id_recipe",
                    as: "comments"
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
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    likeCount: { $sum: { $size: "$likes" } },
                    commentCount: { $sum: { $size: "$comments" } },
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
                $project: {
                    comments: 0,
                    likes: 0,
                    author: 0,
                    id_user: 0,
                    user: 0,
                }
            }
        ])

        const collections = await recipesAggr.toArray()

        let isLiked = false
        if (id_user) {
            try {
                id_user = ObjectId.createFromHexString(req.query.user)
                if (await KulineryDB.findData({
                    table_name: "recipe_likes",
                    filter: {
                        id_user,
                        id_recipe: collections[0]._id
                    }
                })) {
                    isLiked = true
                }
            } catch (error) {
                isLiked = false
            }
        }

        if (collections.length >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: {
                    ...collections[0],
                    isLiked
                }
            })
        } else {
            res.status(404).json({
                method: req.method,
                status: false,
                results: collections[0]
            })
        }
    },
}

module.exports = { RecipesController }