const { body } = require("express-validator");
const { KulineryDB } = require("../database/KulineryDB");
require("dotenv").config()

const RecipeModel = [
    body("slug")
        .notEmpty().withMessage("Slug tidak boleh kosong.")
        .isSlug().withMessage("Slug tidak valid")
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
    body("title")
        .notEmpty().withMessage("Title tidak boleh kosong.")
        .isString().withMessage("Title harus berupa string."),
    body("author")
        .notEmpty().withMessage("Author tidak boleh kosong.")
        .isString().withMessage("Author harus berupa string."),
    body("datePublished")
        .notEmpty().withMessage("DatePublished tidak boleh kosong.")
        .custom(value => {
            if (!isISO8601(value)) {
                throw new Error("DatePublished harus berupa tanggal yang valid (format ISO 8601).");
            }
            return true;
        }),
    body("description")
        .notEmpty().withMessage("Description tidak boleh kosong.")
        .isString().withMessage("Description harus berupa string."),
    body("duration")
        .notEmpty().withMessage("Duration tidak boleh kosong.")
        .isIn(["00:30:00", "00:45:00", "01:00:00", "01:00:01"]),
    body("calories")
        .isInt().withMessage("Calories harus berupa integer"),
    body("portion")
        .notEmpty().withMessage("Portion tidak boleh kosong.")
        .isInt({ min: 1 }).withMessage("Portion harus berupa angka positif."),
    body("ingredients")
        .isArray({ min: 1 }).withMessage("Ingredients harus berupa array dan tidak boleh kosong.")
        .custom(ingredients => {
            ingredients.forEach(ingredient => {
                if (typeof ingredient !== 'string') {
                    throw new Error("Setiap ingredient harus berupa string.");
                }
            });
            return true;
        }),
    body("steps")
        .isArray({ min: 1 }).withMessage("Steps harus berupa array dan tidak boleh kosong.")
        .custom(steps => {
            steps.forEach(step => {
                if (typeof step !== 'string') {
                    throw new Error("Setiap step harus berupa string.");
                }
            });
            return true;
        }),
    body("tips")
        .isArray().withMessage("Tips harus berupa array."),
    body("tags")
        .isArray({ min: 1 }).withMessage("Tags harus berupa array dan tidak boleh kosong.")
        .custom(tags => {
            tags.forEach(tag => {
                if (typeof tag !== 'string') {
                    throw new Error("Setiap tag harus berupa string.");
                }
            });
            return true;
        })
];

module.exports = { RecipeModel };
