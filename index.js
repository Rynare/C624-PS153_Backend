require('dotenv').config();
const express = require("express")
const cors = require("cors");
const { route } = require("./src/routes/web");
const { CORS_OPTION } = require("./src/routes/cors");

const port = process.env.PORT || 3000;

const app = express()
app.use(cors(CORS_OPTION))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(route);
app.listen(port, () => {
    try {
        console.log(`Running on ${port}`);
    } catch (error) {
        throw error;
    }
})
