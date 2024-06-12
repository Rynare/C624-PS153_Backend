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
    body("category")
        .notEmpty().withMessage("category tidak boleh kosong.")
        .isIn(["uncategorized", "tips-masak", "inspirasi-dapur", "makanan-gaya-hidup", "resep-lezat-anti-sisa"]).withMessage("category tidak valid."),
    body("description")
        .notEmpty().withMessage("description tidak boleh kosong.")
        .isString().withMessage("description harus berupa string"),
]

module.exports = { ArticleModel }