const { body } = require("express-validator");
const { KulineryDB } = require("../database/KulineryDB");
require("dotenv").config()

const RecipeModel = [
    body('slug')
        .isSlug().withMessage("Slug tidak valid")
        .notEmpty().withMessage("Slug tidak boleh kosong")
        .custom(async value => {
            const slug = await KulineryDB.findData({
                table_name: "recipes",
                filter: {
                    slug: { $eq: value }
                }
            })
            if (slug) {
                throw new Error("Slug sudah terpakai.")
            }
        }),
    body('title').isString().notEmpty(),
    body('author').isString().notEmpty(),
    body('category').isSlug().notEmpty(),
    body('desc').isString().notEmpty(),
    body('duration').isString().notEmpty().isTime(),
    body('calories').isArray(),
    body('ingredients').isArray().notEmpty(),
    body('ingredients.*').isString().notEmpty(),
    body('steps').isArray().notEmpty(),
    body('steps.*').isString().notEmpty()
];

module.exports = { RecipeModel };
