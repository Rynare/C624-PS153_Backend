const { getResepnya } = require("../../services/fetchResepnya")

const CategoriesController = {
    getRecipesCategory: async (req, res) => {
        const response = await getResepnya(req, res, "/api/recipes/categories")
        res.status(200).json({
            ...response.data
        })
    },
    getArticleCategory: async (req, res) => {
        const response = await getResepnya(req, res, "/api/articles/categories")
        res.status(200).json({
            ...response.data
        })
    }
}

module.exports = { CategoriesController }