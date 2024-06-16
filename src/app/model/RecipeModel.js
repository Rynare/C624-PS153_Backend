const { body } = require("express-validator");
const { KulineryDB } = require("../database/KulineryDB");
require("dotenv").config()

const RecipeModel = [
    body("slug")
        .notEmpty().withMessage("Slug tidak boleh kosong.")
        .isSlug().withMessage("Slug tidak valid")
        .isLength({ max: 101 })
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
        .isString().withMessage("Title harus berupa string.")
        .isLength({ max: 61 }),
    body("description")
        .notEmpty().withMessage("Description tidak boleh kosong.")
        .isString().withMessage("Description harus berupa string."),
    body("duration")
        .notEmpty().withMessage("Duration tidak boleh kosong.")
        .isIn(["00:30:00", "00:45:00", "01:00:00", "01:00:01"]),
    body("difficulty")
        .notEmpty().withMessage("Difficulty tidak boleh kosong.")
        .isIn(["easy", "medium", "hard"]).withMessage("Difficulty harus berisi easy, medium atau hard"),
    body("calories")
        .optional()
        .isInt().withMessage("Calories harus berupa integer"),
    body("portion")
        .notEmpty().withMessage("Portion tidak boleh kosong.")
        .isInt({ min: 1, max: 10 }).withMessage("Portion min:1 dan max: 10"),
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
        .optional()
        .isArray().withMessage("Tips harus berupa array.")
        .custom(tips => {
            tips.forEach(tip => {
                if (typeof tip !== 'string') {
                    throw new Error("Setiap tips harus berupa string.");
                }
            });
            return true;
        }),
    body("tags")
        .optional()
        .isArray().withMessage("Tags harus berupa array.")
        .custom(tags => {
            tags.forEach(tag => {
                if (typeof tag !== 'string') {
                    throw new Error("Setiap tag harus berupa string.");
                }
            });
            return true;
        })
];

function preparingNewRecipeData(req, res, next) {
    function parseThisReq(value) {
        try {
            return JSON.parse(value)
        } catch (error) {
            return []
        }
    }
    req.body.tips = parseThisReq(req.body.tips)
    req.body.tags = parseThisReq(req.body.tags)
    req.body.ingredients = parseThisReq(req.body.ingredients)
    req.body.steps = parseThisReq(req.body.steps)
    next()
}

module.exports = { RecipeModel, preparingNewRecipeData };
