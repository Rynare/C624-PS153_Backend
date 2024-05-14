const { body } = require("express-validator");

const RecipeModel = [
    body('title').isString().notEmpty(),
    body('author').isString().notEmpty(),
    body('datePublished').isString().notEmpty(),
    body('desc').isString().notEmpty(),
    body('duration').isString().notEmpty(),
    body('calories').isArray(),
    body('product_useds').isArray().notEmpty(),
    body('product_useds.*.name').isString().notEmpty(),
    body('product_useds.*.thumbnail').isURL(),
    body('ingredients').isArray().notEmpty(),
    body('ingredients.*').isString().notEmpty(),
    body('steps').isArray().notEmpty(),
    body('steps.*').isString().notEmpty()
];

module.exports = { RecipeModel };
