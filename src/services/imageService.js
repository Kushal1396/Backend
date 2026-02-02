const sharp = require('sharp');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs').promises;

/**
 * Change or remove image background
 */
async function changeBackground(imagePath, backgroundColor = null) {
    try {
        console.log('🔄 Processing background change...');

        // Read image
        const imageBuffer = await fs.readFile(imagePath);

        // Remove background
        const noBgBuffer = await removeBackground(imageBuffer);

        // If backgroundColor is provided, add that background
        // Otherwise, return transparent PNG
        let result;

        if (backgroundColor) {
            // Parse color (supports hex like #FF0000 or rgb values)
            let bgColor;

            if (backgroundColor.startsWith('#')) {
                // Convert hex to RGB
                const hex = backgroundColor.replace('#', '');
                bgColor = {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
            } else {
                // Default to white
                bgColor = { r: 255, g: 255, b: 255 };
            }

            result = await sharp(noBgBuffer)
                .flatten({ background: bgColor })
                .jpeg({ quality: 95 })
                .toBuffer();
        } else {
            // Return PNG with transparent background
            result = await sharp(noBgBuffer)
                .png()
                .toBuffer();
        }

        // Clean up
        await fs.unlink(imagePath);

        console.log('✅ Background changed successfully');
        return result;
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
 * Resize image to specified dimensions
 */
async function resizeImage(imagePath, width, height, maintainAspectRatio = false) {
    try {
        console.log(`🔄 Resizing image to ${width}x${height}...`);

        const imageBuffer = await fs.readFile(imagePath);

        const resizeOptions = maintainAspectRatio
            ? { width, height, fit: 'inside' }
            : { width, height, fit: 'fill' };

        const resizedImage = await sharp(imageBuffer)
            .resize(resizeOptions)
            .toBuffer();

        // Clean up
        await fs.unlink(imagePath);

        console.log('✅ Image resized successfully');
        return resizedImage;
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
 * Compress image with quality control
 */
async function compressImage(imagePath, quality = 80) {
    try {
        console.log(`🔄 Compressing image (quality: ${quality})...`);

        const imageBuffer = await fs.readFile(imagePath);
        const metadata = await sharp(imageBuffer).metadata();

        let compressedImage;

        // Compress based on original format
        if (metadata.format === 'png') {
            compressedImage = await sharp(imageBuffer)
                .png({ quality, compressionLevel: 9 })
                .toBuffer();
        } else if (metadata.format === 'webp') {
            compressedImage = await sharp(imageBuffer)
                .webp({ quality })
                .toBuffer();
        } else {
            // Default to JPEG
            compressedImage = await sharp(imageBuffer)
                .jpeg({ quality })
                .toBuffer();
        }

        // Clean up
        await fs.unlink(imagePath);

        console.log('✅ Image compressed successfully');
        return compressedImage;
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
 * Convert image format
 */
async function convertFormat(imagePath, targetFormat) {
    try {
        console.log(`🔄 Converting to ${targetFormat}...`);

        const imageBuffer = await fs.readFile(imagePath);
        let convertedImage;

        switch (targetFormat.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                convertedImage = await sharp(imageBuffer)
                    .jpeg({ quality: 95 })
                    .toBuffer();
                break;
            case 'png':
                convertedImage = await sharp(imageBuffer)
                    .png()
                    .toBuffer();
                break;
            case 'webp':
                convertedImage = await sharp(imageBuffer)
                    .webp({ quality: 95 })
                    .toBuffer();
                break;
            default:
                throw new Error(`Unsupported format: ${targetFormat}`);
        }

        // Clean up
        await fs.unlink(imagePath);

        console.log('✅ Format converted successfully');
        return convertedImage;
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
    changeBackground,
    resizeImage,
    compressImage,
    convertFormat
};
