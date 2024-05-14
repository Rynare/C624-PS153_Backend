const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")

const dataPerPage = 12

const RecipesController = {
    getRecipes: async (req, res) => {
        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            options: {
                limit: dataPerPage,
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, "/api/recipes")
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

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
                date_publised: new Date(),
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

    getRecipesOnPage: async (req, res) => {
        const page = req.params.page
        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, "/api/recipes/page/" + page)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

    getRecipesBySearch: async (req, res) => {
        const keyword = req.params.keyword

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "title": { $regex: keyword },
                "desc": { $regex: keyword },
                "ingredients": {
                    $elemMatch: { $regex: keyword }
                },
                "steps": {
                    $elemMatch: { $regex: keyword }
                },
            },
            options: {
                limit: dataPerPage
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, "/api/recipes/search/" + keyword)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

    getRecipesBySearchOnPage: async (req, res) => {
        const page = req.params.page
        const keyword = req.params.keyword

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "title": { $regex: keyword },
                "desc": { $regex: keyword },
                "ingredients": {
                    $elemMatch: { $regex: keyword }
                },
                "steps": {
                    $elemMatch: { $regex: keyword }
                },
            },
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, `/api/recipes/search/${keyword}/${page}`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

    getRecipesByCategory: async (req, res) => {
        const category_slug = req.params.category_slug

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "category": { $regex: category_slug }
            },
            options: {
                limit: dataPerPage
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, "/api/recipes/category/" + category_slug)

            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

    getRecipesByCategoryOnPage: async (req, res) => {
        const category_slug = req.params.category_slug
        const page = req.params.page

        const collections = await KulineryDB.findDatas({
            table_name: "recipes",
            filter: {
                "category": { $regex: category_slug }
            },
            options: {
                limit: dataPerPage,
                skip: page * dataPerPage
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, `/api/recipes/category/${category_slug}/${page}`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },

    getRecipeDetail: async (req, res) => {
        const slug = req.params.slug

        const collections = await KulineryDB.findData({
            table_name: "recipes",
            filter: {
                "slug": { $eq: slug }
            },
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                status: true,
                results: collections
            })
        } else {
            const response = await getResepnya(req, res, `/api/recipe/${slug}/`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    }
}

module.exports = { RecipesController }