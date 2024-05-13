const { getResepnya } = require("../../services/fetchResepnya")

const RecipesController = {
    getRecipes: async (req, res) => {
        const response = await getResepnya(req, res, "/api/recipes")
        res.json(
            response.data
        )
    },
    postRecipe: (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Jika berhasil, kirim response dengan path file yang diunggah
            res.status(200).json({ filePath: req.file.path });
        });
        res.json({
            msg: "sukses"
        })
    }
}

module.exports = { RecipesController }