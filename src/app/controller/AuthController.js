const { sanitizeReq } = require("../../helper/sanitizeFromXSS")
const { KulineryDB } = require("../database/KulineryDB")

const AuthController = {
    postNewUser: async (req, res) => {
        const { uid, email, name, profilePicture } = req.body;

        try {
            const existingUser = await KulineryDB.findData({
                table_name: "users",
                filter: { email: sanitizeReq(email) }
            });

            let response;
            if (existingUser) {
                response = await KulineryDB.updateData({
                    table_name: "users",
                    filter: { email: sanitizeReq(email) },
                    updateDoc: {
                        $set: {
                            uid: sanitizeReq(uid),
                        }
                    }
                });

                res.status(200).json({
                    method: req.method,
                    message: `Welcome back ${existingUser.name}.`,
                    details: {
                        id: existingUser._id,
                        uid,
                        email,
                        name: existingUser.name,
                        profilePicture: existingUser.profilePicture
                    }
                });
            } else {
                response = await KulineryDB.insertData({
                    table_name: "users",
                    data: {
                        uid: sanitizeReq(uid),
                        email: sanitizeReq(email),
                        name: sanitizeReq(name),
                        profilePicture: sanitizeReq(profilePicture),
                    }
                });

                res.status(201).json({
                    method: req.method,
                    message: "User berhasil terdaftar.",
                    details: {
                        id: response.insertedId,
                        uid,
                        email,
                        name,
                        profilePicture
                    }
                });
            }
        } catch (error) {
            res.status(500).json({
                method: req.method,
                message: "Internal server error.",
                error: error.message
            });
        }
    },
    getUserInformation: async (req, res) => {
        try {
            const db = KulineryDB.getConnection()
            const table = db.collection("users")
            const usersArr = await table.aggregate([
                {
                    $match: {
                        _id: req.user._id,
                        uid: req.user.uid
                    }
                },
                {
                    $lookup: {
                        from: "recipes",
                        localField: "_id",
                        foreignField: "id_user",
                        as: "recipes"
                    }
                },
                {
                    $lookup: {
                        from: "articles",
                        localField: "_id",
                        foreignField: "id_user",
                        as: "articles"
                    }
                },
                {
                    $lookup: {
                        from: "article_likes",
                        localField: "_id",
                        foreignField: "id_user",
                        as: "article_likes"
                    }
                },
                {
                    $lookup: {
                        from: "recipe_likes",
                        localField: "_id",
                        foreignField: "id_user",
                        as: "recipe_likes"
                    }
                },
                {
                    $project: {
                        uid: 1,
                        name: 1,
                        email: 1,
                        profilePicture: 1,
                        totalRecipes: { $size: "$recipes" },
                        totalArticles: { $size: "$articles" },
                        totalArticleLikes: { $size: "$article_likes" },
                        totalRecipeLikes: { $size: "$recipe_likes" }
                    }
                }
            ]).toArray()
            res.status(200).json({
                method: req.method,
                status: usersArr.length >= 1,
                results: usersArr[0]
            })
        } catch (error) {
            res.status(500).json({
                method: req.method,
                status: false,
                message: error.message
            })
        }
    },
    updateUser: async (req, res) => {
        let updateDoc = {}
        if (req?.file?.path) updateDoc = { ...updateDoc, profilePicture: req.file.path }
        if (req?.body?.name) updateDoc = { ...updateDoc, name: sanitizeReq(req.body.name) }
        if (req?.file?.path || req?.body?.name) {
            try {
                const updatedData = await KulineryDB.updateData({
                    table_name: "users",
                    filter: {
                        _id: req.user._id
                    },
                    updateDoc: {
                        $set: {
                            ...updateDoc
                        }
                    }
                });
                res.status(200).json({
                    method: req.method,
                    status: true,
                    message: "Data pengguna berhasil diperbarui.",
                    results: updatedData,
                })
            } catch (error) {
                res.status(500).json({
                    method: req.method,
                    status: false,
                    message: "Internal Server error",
                    error
                })
            }
        } else {
            res.status(200).json({
                method: req.method,
                status: false,
                message: "Tidak ada data yang diupdate!"
            })
        }
    }
}

module.exports = { AuthController }