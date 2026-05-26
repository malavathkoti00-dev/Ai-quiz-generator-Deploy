const pdfParse = require('pdf-parse');

const extractPdfText = async (buffer) => {
    if (!buffer || !buffer.length) {
        throw new Error('Uploaded PDF is empty.');
    }

    try {
        console.log('Starting PDF parsing, buffer size:', buffer.length);
        // Ensure we have a real Buffer
        const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
        
        const data = await pdfParse(pdfBuffer);
        console.log('PDF parsed successfully, text length:', data.text ? data.text.length : 0);

        if (!data.text || data.text.trim().length === 0) {
            throw new Error('PDF contains no extractable text. It may be an image-based PDF or corrupted.');
        }

        return data.text.trim();
    } catch (err) {
        console.error('PDF Parse Internal Error:', err.message);
        throw new Error('PDF parsing failed: ' + err.message);
    }
};

const extractTextFromFile = async (file) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        console.log('Processing file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer
        });

        if (file.mimetype === 'application/pdf') {
            const text = await extractPdfText(file.buffer);
            return text;
        } else if (file.mimetype === 'text/plain') {
            const text = file.buffer.toString('utf-8').trim();
            if (!text) {
                throw new Error('Text file is empty');
            }
            return text;
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
        }
    } catch (error) {
        console.error('Extraction Error:', error.message);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
};

module.exports = { extractTextFromFile };
