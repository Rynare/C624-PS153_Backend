require("dotenv").config()
const axios = require('axios');

const getResepnya = async (req, res, url) => {
    const endpoint = process.env.PUBLIC_API;
    try {
        const response = await axios(`${endpoint}${url}`);
        return new Promise((resolve, reject) => {
            if (response.status === 200) resolve(response);
            reject(response);
        });
    } catch (error) {
        res.status(500).json({
            method: req.method,
            status: false,
            error: {
                message: 'An unexpected error occurred',
                details: error.toString()
            }
        })
    }
}

module.exports = { getResepnya }