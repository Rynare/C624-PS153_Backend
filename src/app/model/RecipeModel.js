const { body } = require("express-validator");

const MAX_FILE_SIZE_MB = 2; // Ukuran maksimal file dalam MB

const RecipeModel = [
    // body('title').isString().notEmpty(),
    body('thumbnail').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Thumbnail file is required');
        }

        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedFormats.includes(req.file.mimetype)) {
            throw new Error('Thumbnail must be in JPEG, JPG, or WEBP format');
        }

        const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
        if (req.file.size > maxSizeBytes) {
            throw new Error(`Thumbnail size must be less than ${MAX_FILE_SIZE_MB}MB`);
        }

        return true;
    }),
    // body('author').isString().notEmpty(),
    // body('datePublished').isString().notEmpty(),
    // body('desc').isString().notEmpty(),
    // body('duration').isString().notEmpty(),
    // body('calories').isArray(),
    // body('product_useds').isArray().notEmpty(),
    // body('product_useds.*.name').isString().notEmpty(),
    // body('product_useds.*.thumbnail').isURL(),
    // body('ingredients').isArray().notEmpty(),
    // body('ingredients.*').isString().notEmpty(),
    // body('steps').isArray().notEmpty(),
    // body('steps.*').isString().notEmpty()
];

module.exports = { RecipeModel };
