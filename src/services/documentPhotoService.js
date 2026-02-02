const sharp = require('sharp');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs').promises;

/**
 * Photo format specifications
 */
const FORMATS = {
    passport: { width: 827, height: 1063, name: 'Passport Photo' }, // 35mm x 45mm at 600 DPI
    resume: { width: 600, height: 800, name: 'Resume Photo' },
    linkedin: { width: 400, height: 400, name: 'LinkedIn Profile' },
    square: { width: 500, height: 500, name: 'Square Profile' },
    formUpload: { width: 300, height: 400, name: 'Form Upload' },
    signature: { width: 300, height: 100, name: 'Signature Size' }
};

/**
 * Process image to specific dimensions
 */
async function processImageFormat(imageBuffer, width, height, fitType = 'cover') {
    try {
        const processedImage = await sharp(imageBuffer)
            .resize(width, height, {
                fit: fitType,
                position: 'center',
                background: { r: 255, g: 255, b: 255 }
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 95 })
            .toBuffer();

        return processedImage;
    } catch (error) {
        console.error(`Error processing ${width}x${height} format:`, error.message);
        throw error;
    }
}

/**
 * Generate all document photo formats from single upload
 */
async function generateDocumentPhotos(imagePath) {
    try {
        console.log('📸 Processing document photos:', imagePath);

        // Read image
        const imageBuffer = await fs.readFile(imagePath);

        // Remove background
        console.log('🔄 Removing background...');
        const noBgBuffer = await removeBackground(imageBuffer);
        console.log('✅ Background removed');

        // Generate all formats
        const results = {};

        for (const [key, spec] of Object.entries(FORMATS)) {
            console.log(`🔄 Generating ${spec.name}...`);

            // Determine fit type (cover for most, contain for signature)
            const fitType = key === 'signature' ? 'contain' : 'cover';

            const imageBuffer = await processImageFormat(
                noBgBuffer,
                spec.width,
                spec.height,
                fitType
            );

            // Convert to base64
            results[key] = {
                name: spec.name,
                dimensions: `${spec.width}x${spec.height}`,
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            };
        }

        console.log('✅ All document photos generated');

        // Clean up uploaded file
        await fs.unlink(imagePath);

        return results;
    } catch (error) {
        // Clean up on error
        try {
            await fs.unlink(imagePath);
        } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError.message);
        }
        throw error;
    }
}

/**
 * Generate specific document photo format
 */
async function generateSpecificFormat(imagePath, formatKey) {
    try {
        if (!FORMATS[formatKey]) {
            throw new Error(`Invalid format: ${formatKey}`);
        }

        console.log(`📸 Processing ${FORMATS[formatKey].name}:`, imagePath);

        // Read image
        const imageBuffer = await fs.readFile(imagePath);

        // Remove background
        console.log('🔄 Removing background...');
        const noBgBuffer = await removeBackground(imageBuffer);

        // Generate specific format
        const spec = FORMATS[formatKey];
        const fitType = formatKey === 'signature' ? 'contain' : 'cover';

        const processedImage = await processImageFormat(
            noBgBuffer,
            spec.width,
            spec.height,
            fitType
        );

        console.log(`✅ ${spec.name} generated`);

        // Clean up uploaded file
        await fs.unlink(imagePath);

        return processedImage;
    } catch (error) {
        // Clean up on error
        try {
            await fs.unlink(imagePath);
        } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError.message);
        }
        throw error;
    }
}

module.exports = {
    generateDocumentPhotos,
    generateSpecificFormat,
    FORMATS
};
