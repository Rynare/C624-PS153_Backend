const { getResepnya } = require("../../services/fetchResepnya")
const { cloudinary } = require("../../utils/cloudinary")
const { KulineryDB } = require("../database/KulineryDB")
const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { response, json } = require("express")
const moment = require("moment")
const { ObjectId } = require("mongodb")

const dataPerPage = 12
const tableName = "articles";

const ArticleController = {
    postArticle: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    method: req.method,
                    status: false,
                    message: "File thumbnail harus disertakan."
                });
            }
            const { description, title, slug, category: categorySlug } = req.body;

            const getCategoryName = (catSlug) => catSlug.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');


            const category = {
                "slug": categorySlug,
                "name": getCategoryName(categorySlug),
            };

            const newArticle = await KulineryDB.insertData({
                table_name: "articles",
                data: {
                    slug,
                    title: sanitizeReq(title),
                    thumbnail: req.file.path,
                    id_user: req.user._id,
                    datePublished: moment().toISOString(),
                    description: sanitizeReq(description),
                    category,
                }
            });

            if (newArticle) {
                return res.status(201).json({
                    method: req.method,
                    status: true,
                    results: newArticle
                });
            } else {
                return res.status(500).json({
                    method: req.method,
                    status: false,
                    results: {
                        error: "Error",
                        message: "Gagal menambahkan artikel baru. Terjadi kendala pada server kami."
                    }
                });
            }
        } catch (error) {
            return res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Error",
                    message: error.message
                }
            });
        }
    },
    getArticles: async (req, res) => {
        try {
            const db = KulineryDB.getConnection()
            const articles = db.collection("articles")
            const collections = articles.aggregate([
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
                        author: { $first: "$authorName" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: { datePublished: -1, title: 1 }
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
                        category: 1,
                        author: 1,
                        likes: "$likeCount"
                    }
                }
            ]);

            const articleArr = await collections.toArray();
            const collectionTotal = articleArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: true,
                    results: articleArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: false,
                    results: articleArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan daftar artikel.",
                }
            });
        }
    },
    getArticleDetail: async (req, res) => {
        const slug = req.params.slug
        let id_user = req.query.user

        const db = KulineryDB.getConnection()
        const table = db.collection("articles")
        const rawArticleDetail = table.aggregate([
            {
                $match: {
                    slug: slug,
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
                $lookup: {
                    from: "article_comments",
                    localField: "_id",
                    foreignField: "id_article",
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
                    },
                    authorUID: "$user.uid"
                }
            },
            {
                $project: {
                    comments: 0,
                    likes: 0,
                    author: 0,
                    user: 0,
                    id_user: 0,
                }
            }
        ])

        const collections = await rawArticleDetail.toArray()

        let isLiked = false
        if (id_user) {
            try {
                id_user = ObjectId.createFromHexString(req.query.user)
                if (await KulineryDB.findData({
                    table_name: "article_likes",
                    filter: {
                        id_user,
                        id_article: collections[0]._id
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
    getArticlesOnPage: async (req, res) => {
        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        try {
            const db = KulineryDB.getConnection()
            const articles = db.collection("articles")
            const collections = articles.aggregate([
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
                        author: { $first: "$authorName" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: { datePublished: -1, title: 1 }
                },
                {
                    $skip: dataPerPage * page
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
                        category: 1,
                        author: 1,
                        likes: "$likeCount"
                    }
                }
            ]);

            const articleArr = await collections.toArray();
            const collectionTotal = articleArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: true,
                    results: articleArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: false,
                    results: articleArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan daftar artikel.",
                    er: JSON.stringify(error)
                }
            });
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
    getArticlesBySearch: async (req, res) => {
        const keyword = req.params.keyword

        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        try {
            const db = KulineryDB.getConnection()
            const articles = db.collection("articles")
            const collections = articles.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: keyword, $options: 'i' } },
                            { description: { $regex: keyword, $options: 'i' } }
                        ]
                    }
                }, {
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
                        author: { $first: "$authorName" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: { datePublished: -1, title: 1 }
                },
                {
                    $skip: dataPerPage * page
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
                        category: 1,
                        author: 1,
                        likes: "$likeCount"
                    }
                }
            ]);

            const articleArr = await collections.toArray();
            const collectionTotal = articleArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: true,
                    results: articleArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: false,
                    results: articleArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan daftar artikel.",
                    er: JSON.stringify(error)
                }
            });
        }
    },
    getArticlesBySearchOnPage: async (req, res) => {
        const keyword = req.params.keyword

        let { page } = req.params
        if (page >= 1) {
            page -= 1
        } else {
            page = 0
        }
        try {
            const db = KulineryDB.getConnection()
            const articles = db.collection("articles")
            const collections = articles.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: keyword, $options: 'i' } },
                            { description: { $regex: keyword, $options: 'i' } }
                        ]
                    }
                }, {
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
                        author: { $first: "$authorName" },
                        datePublished: { $first: "$datePublished" }
                    }
                },
                {
                    $sort: { datePublished: -1, title: 1 }
                },
                {
                    $skip: dataPerPage * page
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
                        category: 1,
                        author: 1,
                        likes: "$likeCount"
                    }
                }
            ]);

            const articleArr = await collections.toArray();
            const collectionTotal = articleArr.length || 0
            const totalDocs = await KulineryDB.getTotalItem({ table_name: tableName }) || 0
            const totalPages = Math.ceil(totalDocs / dataPerPage)

            if (collectionTotal >= 1) {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: true,
                    results: articleArr
                })
            } else {
                res.status(200).json({
                    method: req.method,
                    pages: totalPages,
                    status: false,
                    results: articleArr
                })
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "internal server error!",
                    message: "Gagal mendapatkan daftar artikel.",
                    er: JSON.stringify(error)
                }
            });
        }
    },
    deleteArticle: async (req, res) => {
        try {
            const id_article = ObjectId.createFromHexString(req.body.id_article)
            const deleted = await KulineryDB.deleteData({
                table_name: "articles",
                filter: {
                    id_user: req.user._id,
                    _id: id_article
                },
            })

            if (deleted.deletedCount > 0) {
                KulineryDB.deleteDatas({
                    table_name: "article_likes",
                    filter: {
                        id_article: { $eq: id_article }
                    }
                })
                KulineryDB.deleteDatas({
                    table_name: "article_comments",
                    filter: {
                        id_article: { $eq: id_article }
                    }
                })
                res.status(200).json({
                    method: req.method,
                    status: true,
                    message: 'Artikel berhasil dihapus'
                });
            } else {
                res.status(404).json({
                    method: req.method,
                    status: false,
                    message: 'Artikel tidak ditemukan atau tidak dapat dihapus'
                });
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                message: 'Terjadi kesalahan saat menghapus artikel',
                error: error.message
            });
        }
    }
}
module.exports = { ArticleController }