const { body } = require("express-validator")

const CommentModel = [
    body("url")
        .notEmpty().withMessage("URL tidak boleh kosong")
        .isURL().withMessage("URL tidak valid"),
    body("username")
        .notEmpty().withMessage("Username tidak boleh kosong")
        .isString().withMessage("Username harus berupa string"),
    body("msg")
        .notEmpty().withMessage("Komentar tidak boleh kosong")
        .isString().withMessage("Komentar harus berupa string"),
]

module.exports = { CommentModel }