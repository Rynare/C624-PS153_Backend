const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { response } = require("express")
const moment = require("moment")

const dataPerPage = 12
const tableName = "articles";

const ArticleController = {
    postArticle: async (req, res) => {
        const imgUploadResult = await cloudinary.uploader.upload(req.file.path)
        const { secure_url } = imgUploadResult
        const { author, description, title, slug, category: categorySlug } = req.body
        const getCategoryName = (catSlug) => catSlug.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

        category = {
            "categorySlug": category,
            "categoryName": getCategoryName(categorySlug),
        }

        const newArticle = await KulineryDB.insertData({
            table_name: "articles",
            data: {
                slug,
                title: sanitizeReq(title),
                thumbnail: secure_url,
                author: sanitizeReq(author),
                datepublished: moment().toISOString(),
                description: sanitizeReq(description),
                category,
            }
        })
        if (newArticle) {
            res.status(201).json({
                method: req.method,
                status: true,
                results: newArticle
            })
        } else {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Error",
                    message: "Gagal menambahkan artikel baru. Terjadi kendala pada server kammi."
                }
            })
        }
    },
    getArticles: async (req, res) => {
        const collections = await KulineryDB.findDatas({
            table_name: tableName,
            options: {
                limit: dataPerPage,
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    thumbnail: 1,
                    category: 1,
                }
            }
        })

        const collectionTotal = collections.length || 0
        const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
        const totalPages = Math.ceil(totalDocs / dataPerPage)

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                pages: totalPages,
                status: true,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                pages: totalPages,
                status: false,
                results: collections
            })
        }
    },
    getArticleDetail: async (req, res) => {
        const slug = req.params.slug

        const collections = await KulineryDB.findData({
            table_name: "articles",
            filter: {
                slug: { $eq: slug }
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
                results: collections
            })
        }
    },
    getArticlesOnPage: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }

        const collections = await KulineryDB.findDatas({
            table_name: "articles",
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page,
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    thumbnail: 1,
                    category: 1,
                }
            }
        })

        const collectionTotal = collections.length || 0
        const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
        const totalPages = Math.ceil(totalDocs / dataPerPage)

        if (collectionTotal >= 1) {
            res.status(200).json({
                method: req.method,
                pages: totalPages,
                status: true,
                results: collections
            })
        } else {
            res.status(200).json({
                method: req.method,
                pages: totalPages,
                status: false,
                results: collections
            })
        }
    },
    getArticlesByCategory: async (req, res) => {
        const category_slug = req.params.category_slug
        const collections = await KulineryDB.findDatas({
            table_name: "articles",
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
                    category: 1,
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
    getArticlesByCategoryOnPage: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        const category_slug = req.params.category_slug
        const collections = await KulineryDB.findDatas({
            table_name: "articles",
            filter: {
                "category.slug": { $eq: category_slug }
            },
            options: {
                limit: dataPerPage,
                skip: dataPerPage * page,
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    thumbnail: 1,
                    category: 1,
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
}
module.exports = { ArticleController }