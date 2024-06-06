const { body } = require("express-validator")

const CommentModel = [
    body("msg")
        .notEmpty().withMessage("Komentar tidak boleh kosong")
        .isString().withMessage("Komentar harus berupa string"),
]

module.exports = { CommentModel }