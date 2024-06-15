const { body } = require("express-validator");
const { KulineryDB } = require("../database/KulineryDB");

const ArticleModel = [
    body("slug")
        .notEmpty().withMessage("slug tidak boleh kosong")
        .isSlug().withMessage("slug tidak valid")
        .custom(async value => {
            const slug = await KulineryDB.findData({
                table_name: "articles",
                filter: {
                    slug: { $eq: value }
                }
            })
            if (slug) {
                throw new Error("slug sudah terpakai.")
            }
        }),
    body("title")
        .notEmpty().withMessage("title tidak boleh kosong.")
        .isString().withMessage("title harus berupa string."),
    body('category')
        .notEmpty().withMessage('Category tidak boleh kosong.')
        .custom(async (value) => {
            const isValid = await KulineryDB.findData({ table_name: "article_categories", filter: { slug: value } })
            if (!isValid) {
                throw new Error('Category tidak valid');
            }
        }),
    body("description")
        .notEmpty().withMessage("description tidak boleh kosong.")
        .isString().withMessage("description harus berupa string"),
]

module.exports = { ArticleModel }