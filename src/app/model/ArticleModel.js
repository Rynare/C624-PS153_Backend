const { body } = require("express-validator");

const ArticleModel = [
    body("title").notEmpty().isString(),
    body("author").notEmpty().isString(),
    body("description").notEmpty().isArray(),
    body("description.*").notEmpty().isString(),
]

module.exports = { ArticleModel }