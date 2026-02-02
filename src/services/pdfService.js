const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Convert single or multiple images to PDF
 */
async function imageToPDF(imagePaths, pageSize = 'A4') {
    try {
        console.log('📄 Converting images to PDF...');

        return new Promise(async (resolve, reject) => {
            try {
                // Create PDF document
                const doc = new PDFDocument({
                    size: pageSize,
                    margin: 50
                });

                // Collect PDF chunks
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add each image to the PDF
                for (let i = 0; i < imagePaths.length; i++) {
                    const imagePath = imagePaths[i];

                    try {
                        // Read and optimize image
                        const imageBuffer = await fs.readFile(imagePath);
                        const metadata = await sharp(imageBuffer).metadata();

                        // Get page dimensions
                        const pageWidth = doc.page.width - 100; // 50px margin on each side
                        const pageHeight = doc.page.height - 100;

                        // Calculate scaling to fit page
                        const widthRatio = pageWidth / metadata.width;
                        const heightRatio = pageHeight / metadata.height;
                        const scale = Math.min(widthRatio, heightRatio, 1);

                        const finalWidth = metadata.width * scale;
                        const finalHeight = metadata.height * scale;

                        // Center image on page
                        const x = (doc.page.width - finalWidth) / 2;
                        const y = (doc.page.height - finalHeight) / 2;

                        // Add image to PDF
                        doc.image(imageBuffer, x, y, {
                            width: finalWidth,
                            height: finalHeight
                        });

                        // Add new page if not last image
                        if (i < imagePaths.length - 1) {
                            doc.addPage();
                        }

                        // Clean up image file
                        await fs.unlink(imagePath);

                    } catch (imageError) {
                        console.error(`Error processing image ${imagePath}:`, imageError.message);
                        // Try to clean up
                        try {
                            await fs.unlink(imagePath);
                        } catch (unlinkError) {
                            // Ignore
                        }
                        throw imageError;
                    }
                }

                // Finalize PDF
                doc.end();

                console.log('✅ PDF created successfully');
            } catch (error) {
                // Clean up remaining files
                for (const imagePath of imagePaths) {
                    try {
                        await fs.unlink(imagePath);
                    } catch (unlinkError) {
                        // Ignore
                    }
                }
                reject(error);
            }
        });
    } catch (error) {
        // Clean up on error
        for (const imagePath of imagePaths) {
            try {
                await fs.unlink(imagePath);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError.message);
            }
        }
        throw error;
    }
}

module.exports = {
    imageToPDF
};
