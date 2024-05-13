const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `uploads/img-article/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadArticleImg = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // max (2MB)
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, JPG, and WEBP files are allowed'));
    }
});

module.exports = { uploadRecipeImg: uploadArticleImg }