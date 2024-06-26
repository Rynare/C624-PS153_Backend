const { body } = require("express-validator");

const UserModel = [
    body("uid")
        .notEmpty().withMessage("UID Tidak boleh kosong")
        .isString().withMessage("UID Harus berupa text"),
    body("email")
        .notEmpty().withMessage("Email tidak boleh kosong")
        .isEmail().withMessage("Email tidak valid"),
    body("name")
        .notEmpty().withMessage("Name tidak boleh kosong")
        .isString().withMessage("Name harus berupa text"),
    body("profilePicture")
        .notEmpty().withMessage("profilePicture tidak boleh kosong")
        .isURL().withMessage("profilePicture harus berupa url"),
]

module.exports = { UserModel }