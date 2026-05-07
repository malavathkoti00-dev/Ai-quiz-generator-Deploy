const pdfParse = require('pdf-parse');

const extractPdfText = async (buffer) => {
    if (!buffer || !buffer.length) {
        throw new Error('Uploaded PDF is empty.');
    }

    try {
        // pdf-parse v1 - simple function call with buffer
        const data = await pdfParse(buffer);
        return data.text || '';
    } catch (err) {
        console.error('PDF Parse Internal Error:', err);
        throw new Error('PDF parsing failed: ' + err.message);
    }
};

const extractTextFromFile = async (file) => {
    try {
        if (!file) return null;

        if (file.mimetype === 'application/pdf') {
            return await extractPdfText(file.buffer);
        } else if (file.mimetype === 'text/plain') {
            return file.buffer.toString('utf-8');
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
        }
    } catch (error) {
        console.error('Extraction Error:', error);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
};

module.exports = { extractTextFromFile };
