const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")

const dataPerPage = 12
const tableName = "recipes"

const RecipesController = {
    postRecipe: async (req, res) => {
        const imgUploadResult = await cloudinary.uploader.upload(req.file.path)
        const { secure_url } = imgUploadResult
        const { slug, title, author, desc, duration, calories, ingredients } = req.body
        const newRecipes = await KulineryDB.insertData({
            table_name: "recipes",
            data: {
                slug,
                thumbnail: secure_url,
                title: sanitizeReq(title),
                author: sanitizeReq(author),
                datepublished: new Date(),
                desc: sanitizeReq(desc),
                duration,
                ingredients,
                calories,
            }
        })
        res.status(201).json({
            method: req.method,
            status: true,
            results: newRecipes
        })
    },

    getRecipes: async (req, res) => {
        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
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
        const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
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

    getRecipesOnPage: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page,
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
        const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
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

        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
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
                skip: dataPerPage * page,
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

        const collections = await KulineryDB.findData({
            table_name: "recipes",
            filter: {
                "slug": { $eq: slug }
            },
            options: {
                projection: {
                    _id: 0,
                }
            }
        })

        if (collections) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            res.status(404).json({
                method: req.method,
                status: false,
                results: []
            })
        }
    }
}

module.exports = { RecipesController }