const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { response } = require("express")

const dataPerPage = 12
const tableName = "articles";

const ArticleController = {
    postArticle: async (req, res) => {
        const imgUploadResult = await cloudinary.uploader.upload(req.file.path)
        const { secure_url } = imgUploadResult
        const { author, description, title, slug, category } = req.body
        const newArticle = KulineryDB.insertData({
            table_name: "articles",
            data: {
                author: sanitizeReq(author),
                description: sanitizeReq(description),
                title: sanitizeReq(title),
                slug,
                category,
                thumbnail: secure_url
            }
        })
        res.status(201).json({
            method: req.method,
            status: true,
            results: newArticle
        })
    },
    getArticles: async (req, res) => {
        const collections = await KulineryDB.findDatas({
            table_name: tableName,
            options: {
                limit: dataPerPage,
            }
        })

        const collectionTotal = collections.length || 0

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                pages: KulineryDB.getTotalItem({ table_name: tableName }) / dataPerPage,
                status: true,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                pages: KulineryDB.getTotalItem({ table_name: tableName }) / dataPerPage,
                status: false,
                results: collections
            })
        }
    },
    getArticleDetail: async (req, res) => {
        const slug = req.params.slug
        const category_slug = req.params.category_slug

        const collections = await KulineryDB.findData({
            table_name: "articles",
            filter: {
                slug: { $eq: slug }
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
            const response = await getResepnya(req, res, `/api/article/${category_slug}/${slug}`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },
    getArticlesOnPage: async (req, res) => {
        const page = req.params.page

        const collections = await KulineryDB.findDatas({
            table_name: "articles",
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
            const response = await getResepnya(req, res, "/api/articles/page/" + page)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },
    getArticlesByCategory: async (req, res) => {
        const category_slug = req.params.category_slug
        const collections = await KulineryDB.findDatas({
            table_name: "articles",
            filter: {
                category: { $eq: category_slug }
            },
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
            const response = await getResepnya(req, res, `/api/articles/category/${category_slug}`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },
    getArticlesByCategoryOnPage: async (req, res) => {
        const page = req.params.page
        const category_slug = req.params.category_slug
        const collections = await KulineryDB.findDatas({
            table_name: "articles",
            filter: {
                category: { $eq: category_slug }
            },
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page,
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
            const response = await getResepnya(req, res, `/api/articles/category/${category_slug}/${page}`)
            const { results } = response.data

            res.status(200).json({
                method: req.method,
                status: true,
                results
            })
        }
    },
}
module.exports = { ArticleController }