const { getResepnya } = require("../../services/fetchResepnya")
const { KulineryDB } = require("../database/KulineryDB")

const CategoriesController = {
    getRecipesCategory: async (req, res) => {
        const response = await KulineryDB.findDatas({
            table_name: "recipe_categories",
            options: {
                projection: {
                    _id: 0,
                }
            }
        })
        if (response.length >= 1) {
            return res.status(200).json({
                method: req.method,
                status: true,
                results: response
            })
        } else {
            return res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Error!",
                    message: "Terjadi masalah pada server."
                }
            })
        }
    },
    getArticleCategory: async (req, res) => {
        const response = await KulineryDB.findDatas({
            table_name: "article_categories",
            options: {
                projection: {
                    _id: 0,
                }
            }
        })
        if (response.length >= 1) {
            return res.status(200).json({
                method: req.method,
                status: true,
                results: response
            })
        } else {
            return res.status(500).json({
                method: req.method,
                status: false,
                results: {
                    error: "Error!",
                    message: "Terjadi masalah pada server."
                }
            })
        }
    }
}

module.exports = { CategoriesController }