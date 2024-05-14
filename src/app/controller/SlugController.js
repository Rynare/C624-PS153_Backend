const { KulineryDB } = require("../database/KulineryDB")

const SlugController = {
    async recipe(req, res) {
        const slug = req.params.slug
        const found = await KulineryDB.findData({
            table_name: "recipes",
            filter: {
                slug: { $eq: slug }
            }
        })
        res.status(200).json({
            method: req.method,
            is_valid: found <= 0
        })
    },
    async article(req, res) {
        const slug = req.params.slug
        const found = await KulineryDB.findData({
            table_name: "articles",
            filter: {
                slug: { $eq: slug }
            }
        })
        res.status(200).json({
            method: req.method,
            is_valid: found <= 0
        })
    },
}

module.exports = { SlugController }