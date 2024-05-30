const route = require('express').Router();
const { CategoriesController } = require('../app/controller/CategoriesController');
const { CommentController } = require('../app/controller/CommentController');
const { RecipesController } = require('../app/controller/RecipesController');
const { CommentModel } = require('../app/model/CommentModel');
const { RecipeModel } = require('../app/model/RecipeModel');
const { validationHandler } = require("../app/middleware/validationHandler");
const { uploadThis, handleMulterError } = require('../app/middleware/multerUploader');
const { ArticleModel } = require('../app/model/ArticleModel');
const { ArticleController } = require('../app/controller/ArticleController');
const { AuthController } = require('../app/controller/AuthController');
const { UserModel } = require('../app/model/UserModel');
const { SlugController } = require('../app/controller/SlugController');

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

route.post("/api/user", UserModel, validationHandler, AuthController.postNewUser)
route.get("/api/user", AuthController.getUser)

route.get("/api/recipes/categories", CategoriesController.getRecipesCategory)
route.get("/api/articles/categories", CategoriesController.getArticleCategory)

route.get("/api/recipe-check-slug/:slug", SlugController.recipe)
route.get("/api/article-check-slug/:slug", SlugController.article)

route.get("/api/recipes", RecipesController.getRecipes)
route.post("/api/recipe", RecipeModel, validationHandler, uploadThis.single("thumbnail"), handleMulterError, RecipesController.postRecipe)
route.get("/api/recipes/page/:page", RecipesController.getRecipesOnPage)
route.get("/api/recipes/search/:keyword", RecipesController.getRecipesBySearch)
route.get("/api/recipes/search/:keyword/:page", RecipesController.getRecipesBySearchOnPage)
route.get("/api/recipe/detail-:slug", RecipesController.getRecipeDetail)
route.get("/api/recipes/category/:category_slug", RecipesController.getRecipesByCategory)
route.get("/api/recipes/category/:category_slug/:page", RecipesController.getRecipesByCategoryOnPage)

route.post("/api/article/", ArticleModel, validationHandler, uploadThis.single("thumbnail"), handleMulterError, ArticleController.postArticle)
route.get("/api/articles/", ArticleController.getArticles)
route.get("/api/articles/page/:page", ArticleController.getArticlesOnPage)
route.get("/api/articles/category/:category_slug", ArticleController.getArticlesByCategory)
route.get("/api/articles/category/:category_slug/:page", ArticleController.getArticlesByCategoryOnPage)
route.get("/api/article/:category_slug/detail-:slug", ArticleController.getArticleDetail)

route.get("/api/comments/:url", CommentController.getComment)
route.get("/api/comments/:url/:load", CommentController.getCommentOnLoad)
route.post("/api/comments/:url", CommentModel, validationHandler, CommentController.postComment)

route.get('*', (req, res) => {
    res.status(404).json({
        method: req.method,
        message: 'Sorry, your request was not found on the server.',
        status: false,
    });
});

module.exports = { route }