const documentPhotoService = require('../services/documentPhotoService');
const ErrorLog = require('../models/errorLog.model');

/**
 * Generate all document photo formats from uploaded image
 */
exports.generateAllFormats = async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const imagePath = req.file.path;

        // Generate all formats
        const documentPhotos = await documentPhotoService.generateDocumentPhotos(imagePath);

        res.status(200).json({
            status: 'success',
            message: 'Document photos generated successfully',
            data: documentPhotos
        });

    } catch (error) {
        console.error('Document photo generation error:', error.message);

        // Log error to database
        try {
            await ErrorLog.create({
                endpoint: '/api/document/generate',
                method: 'POST',
                errorMessage: error.message,
                stackTrace: error.stack,
                userIP: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (logError) {
            console.error('Error logging failed:', logError.message);
        }

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate document photos'
        });
    }
};

/**
 * Generate specific document photo format
 */
exports.generateSpecificFormat = async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const { format } = req.params;
        const imagePath = req.file.path;

        // Validate format
        if (!documentPhotoService.FORMATS[format]) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid format. Available formats: ${Object.keys(documentPhotoService.FORMATS).join(', ')}`
            });
        }

        // Generate specific format
        const photoBuffer = await documentPhotoService.generateSpecificFormat(imagePath, format);

        // Send image as response
        const formatName = documentPhotoService.FORMATS[format].name.toLowerCase().replace(/\s+/g, '-');
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', `attachment; filename="${formatName}.jpg"`);
        res.send(photoBuffer);

    } catch (error) {
        console.error('Document photo generation error:', error.message);

        // Log error to database
        try {
            await ErrorLog.create({
                endpoint: `/api/document/generate/${req.params.format}`,
                method: 'POST',
                errorMessage: error.message,
                stackTrace: error.stack,
                userIP: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (logError) {
            console.error('Error logging failed:', logError.message);
        }

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate document photo'
        });
    }
};
