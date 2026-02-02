const pdfService = require('../services/pdfService');
const ErrorLog = require('../models/errorLog.model');

/**
 * Convert image(s) to PDF
 */
exports.imageToPDF = async (req, res) => {
    try {
        // Check for uploaded files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No image files uploaded'
            });
        }

        const { pageSize } = req.body;
        const imagePaths = req.files.map(file => file.path);

        // Validate page size
        const validPageSizes = ['A4', 'LETTER', 'LEGAL', 'A3', 'A5'];
        const selectedPageSize = pageSize && validPageSizes.includes(pageSize.toUpperCase())
            ? pageSize.toUpperCase()
            : 'A4';

        // Convert to PDF
        const pdfBuffer = await pdfService.imageToPDF(imagePaths, selectedPageSize);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="images-to-pdf.pdf"');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF conversion error:', error.message);

        // Log error to database
        try {
            await ErrorLog.create({
                endpoint: '/api/pdf/image-to-pdf',
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
            message: error.message || 'Failed to convert images to PDF'
        });
    }
};
