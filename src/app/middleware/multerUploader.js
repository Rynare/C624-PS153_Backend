const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadThis = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // max (2MB)
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Hanya JPEG, JPG, and WEBP files yang diizinkan.'));
    }
});

function handleMulterError(req, res) {
    uploadThis(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ method: req.method, error: 'Unggah file gagal', message: err.message });
        } else if (err) {
            return res.status(500).json({ method: req.method, error: 'Internal Server Error', message: err.message });
        }
    })
}

module.exports = { uploadThis, handleMulterError }