const route = require('express').Router();
const { CategoriesController } = require('../app/controller/CategoriesController');
const { CommentController } = require('../app/controller/CommentController');
const { RecipesController } = require('../app/controller/RecipesController');
const { CommentModel } = require('../app/model/CommentModel');
const { RecipeModel, preparingNewRecipeData } = require('../app/model/RecipeModel');
const { validationHandler } = require("../app/middleware/validationHandler");
const { uploadThis, handleMulterError, ensureUploadsDirExists } = require('../app/middleware/multerUploader');
const { ArticleModel } = require('../app/model/ArticleModel');
const { ArticleController } = require('../app/controller/ArticleController');
const { AuthController } = require('../app/controller/AuthController');
const { UserModel } = require('../app/model/UserModel');
const { SlugController } = require('../app/controller/SlugController');
const { PopularController } = require('../app/controller/PopularController');
const { isLogin } = require('../app/middleware/isLogin');
const { LikesController } = require('../app/controller/LikesController');
const { UserActController } = require('../app/controller/UserActController');
const { KulineryDB } = require('../app/database/KulineryDB');

route.get(['/', '/api'], (req, res) => {
    res.status(200).json({
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

route.post("/api/auth", UserModel, validationHandler, AuthController.postNewUser)
route.post("/api/my-profile", isLogin, AuthController.getUserInformation)
route.post("/api/my-profile/update", uploadThis.single("profilePicture"), handleMulterError, isLogin, AuthController.updateUser)
route.post("/api/user/liked-recipe/:page", isLogin, UserActController.getRecipeLiked)
route.post("/api/user/liked-article/:page", isLogin, UserActController.getArticleLiked)

route.get("/api/recipes/categories", CategoriesController.getRecipesCategory)
route.get("/api/articles/categories", CategoriesController.getArticleCategory)

route.get("/api/recipe-check-slug/:slug", SlugController.recipe)
route.get("/api/article-check-slug/:slug", SlugController.article)

route.post("/api/recipe/like/:id_recipe", isLogin, validationHandler, LikesController.recipe)
route.post("/api/article/like/:id_article", isLogin, validationHandler, LikesController.article)

route.post("/api/recipe", uploadThis.single("thumbnail"), handleMulterError, isLogin, preparingNewRecipeData, RecipeModel, validationHandler, RecipesController.postRecipe)
route.delete("/api/recipe", isLogin, RecipesController.deleteRecipe)
route.get("/api/recipes", RecipesController.getRecipes)
route.get("/api/recipes/page/:page", RecipesController.getRecipesOnPage)
route.get("/api/recipes/search/:keyword", RecipesController.getRecipesBySearch)
route.get("/api/recipes/search/:keyword/:page", RecipesController.getRecipesBySearchOnPage)
route.get("/api/recipe/detail/:slug", RecipesController.getRecipeDetail)


route.post("/api/article/", uploadThis.single("thumbnail"), handleMulterError, isLogin, ArticleModel, validationHandler, ArticleController.postArticle)
route.delete("/api/article/", isLogin, ArticleController.deleteArticle)
route.get("/api/articles/", ArticleController.getArticles)
route.get("/api/articles/page/:page", ArticleController.getArticlesOnPage)
route.get("/api/articles/search/:keyword", ArticleController.getArticlesBySearch)
route.get("/api/articles/search/:keyword/:page", ArticleController.getArticlesBySearchOnPage)
route.get("/api/article/detail/:slug", ArticleController.getArticleDetail)

route.get("/api/recipe/comments/:id_recipe/:nth_page", CommentController.getRecipeComments)
route.get("/api/article/comments/:id_article/:nth_page", CommentController.getArticleComments)
route.post("/api/recipe/comments/:id_recipe", isLogin, CommentModel, validationHandler, CommentController.postRecipeComment)
route.post("/api/article/comments/:id_article", isLogin, CommentModel, validationHandler, CommentController.postArticleComment)

route.get("/api/popular-articles", PopularController.topArticles)
route.get("/api/popular-recipes", PopularController.topRecipes)

route.get('*', (req, res) => {
    res.status(404).json({
        method: req.method,
        message: 'Sorry, your request was not found on the server.',
        status: false,
    });
});

module.exports = { route }