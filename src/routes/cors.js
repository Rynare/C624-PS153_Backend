const CORS_OPTION = {
    origin: [
        'http://localhost:3000',
        'https://api-resepnya.vercel.app',
        'http://localhost:8080',
        "https://rynare.github.io"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

module.exports = { CORS_OPTION }