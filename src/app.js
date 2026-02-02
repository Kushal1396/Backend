const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const { applySecurity } = require('./middlewares/security');
const passportRoutes = require('./routes/passportRoutes');
const documentRoutes = require('./routes/documentRoutes');
const imageRoutes = require('./routes/imageRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();

// Security middleware
applySecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'FormPhotoAI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/passport', passportRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/pdf', pdfRoutes);

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // Log to MongoDB (optional, can be added later)

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
