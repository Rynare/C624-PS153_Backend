const { body } = require("express-validator");
const { KulineryDB } = require("../database/KulineryDB");

const ArticleModel = [
    body("slug").notEmpty().isSlug()
        .custom(async value => {
            const slug = await KulineryDB.findData({
                table_name: "articles",
                filter: {
                    slug: { $eq: value }
                }
            })
            if (slug) {
                throw new Error("Slug sudah terpakai.")
            }
        }),
    body("title").notEmpty().isString(),
    body("category").notEmpty().isSlug(),
    body("author").notEmpty().isString(),
    body("description").notEmpty().isArray(),
    body("description.*").notEmpty().isString(),
]

module.exports = { ArticleModel }