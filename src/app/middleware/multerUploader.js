const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require("../../utils/cloudinary");
const path = require('path');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'coba',
        format: async (req, file) => {
            const allowedFormats = ['jpeg', 'jpg', 'webp'];
            const extname = path.extname(file.originalname).toLowerCase().substring(1);
            if (!allowedFormats.includes(extname)) {
                throw new Error('Hanya file JPEG, JPG, dan WEBP yang diizinkan.');
            }
            return extname;
        },
        public_id: (req, file) => {
            return Math.random().toString().substring(2, 7) + new Date().toISOString().substring(0, 10) + Math.random().toString().substring(2, 7);
        },
    },
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

module.exports = { uploadThis, handleMulterError };
