const { KulineryDB } = require("../database/KulineryDB")

const SlugController = {
    async recipe(req, res) {
        try {
            const slug = req.params.slug
        const found = await KulineryDB.findData({
            table_name: "recipes",
            filter: {
                slug: { $eq: slug }
            }
        })
        res.status(200).json({
            method: req.method,
            isValid: found <= 0,
            message: found <= 0 ? "Slug tersedia.": "Slug tidak tersedia."
        })
    } catch (error) {
            res.status(500).json({
                method: req.method,
                isValid: false,
                message: "Slug tidak tersedia."
            })
            
        }
    },
    async article(req, res) {
        try {
            const slug = req.params.slug
        const found = await KulineryDB.findData({
            table_name: "articles",
            filter: {
                slug: { $eq: slug }
            }
        })
        res.status(200).json({
            method: req.method,
            isValid: found <= 0,
            message: found <= 0 ? "Slug tersedia.": "Slug tidak tersedia."
        })
    } catch (error) {
            res.status(500).json({
                method: req.method,
                isValid: false,
                message: "Slug tidak tersedia."
            })
            
        }
    },
}

module.exports = { SlugController }