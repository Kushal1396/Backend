const helmet = require('helmet');
const cors = require('cors');

/**
 * Apply security middleware to Express app
 */
const applySecurity = (app) => {
    // Helmet for security headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:"],
            }
        }
    }));

    // CORS configuration
    const corsOptions = {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };

    app.use(cors(corsOptions));

    // Prevent parameter pollution
    app.use((req, res, next) => {
        // Remove any potentially dangerous characters from query params
        for (let key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].replace(/[<>]/g, '');
            }
        }
        next();
    });
};

module.exports = { applySecurity };
