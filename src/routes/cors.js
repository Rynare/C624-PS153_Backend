const CORS_OPTION = {
    origin: [
        'http://localhost:3000',
        'https://api-resepnya.vercel.app',
        "http://127.0.0.1:5500"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

module.exports = { CORS_OPTION }