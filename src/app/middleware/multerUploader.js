const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureUploadsDirExists = (req, res, next) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    next();
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
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
        cb(new Error('Hanya file JPEG, JPG, dan WEBP yang diizinkan.'));
    }
});

function handleMulterError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ method: req.method, error: 'Unggah file gagal', message: err.message });
    } else if (err) {
        return res.status(500).json({ method: req.method, error: 'Internal Server Error', message: err.message });
    }
    next();
}
module.exports = { uploadThis, handleMulterError, ensureUploadsDirExists }