const route = require('express').Router();
const { body } = require('express-validator');
const { CategoriesController } = require('../app/controller/CategoriesController');
const { CommentController } = require('../app/controller/CommentController');
const { RecipesController } = require('../app/controller/RecipesController');
const { validationHandler } = require("../app/middleware/validationHandler");
const { CommentModel } = require('../app/model/CommentModel');
const { RecipeModel } = require('../app/model/RecipeModel');

route.get(['/', '/api'], (req, res) => {
    res.json({
        method: req.method,
        message: 'Read about API documentation below.',
        documentation: 'https://github.com/Rynare/kulinery-api',
        status: 'active',
        lets_connected: {
            github: 'https://github.com/Rynare',
            facebook: "https://www.facebook.com/fahimdb",
            instagram: "https://www.instagram.com/darkchocolates49",
        }
    });
});

// route.post("/register",)
// route.get()

route.get("/api/recipes/categories", CategoriesController.getRecipesCategory)
route.get("/api/articles/categories", CategoriesController.getArticleCategory)

route.post("/api/recipe", RecipeModel, validationHandler, RecipesController.postRecipe)
route.get("/api/recipes", RecipesController.getRecipes)
// route.get("/api/recipes/page/:page",)
// route.get("/api/recipes/search/",)
// route.get("/api/recipes/detail-:slug",)
// route.get("/api/recipes/category/:category_slug",)
// route.get("/api/recipes/category/:category_slug/:page",)

// route.get("/api/articles/",)
// route.get("/api/articles/category/:category_slug",)
// route.get("/api/articles/category/:category_slug/:page",)
// route.post("/api/articles/",)
// route.get("/api/articles/page/:page",)
// route.get("/api/articles/search/",)
// route.get("/api/articles/detail-:slug",)

// route.get("/api/comments/:url")
// route.post("/api/comments/:url", CommentModel, validationHandler, CommentController.post)

route.get('*', (req, res) => {
    res.status(404).json({
        method: req.method,
        message: 'Sorry, your request was not found on the server.',
        status: false,
    });
});

module.exports = { route }