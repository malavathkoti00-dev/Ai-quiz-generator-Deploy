const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the PDF upload functionality
async function testPdfUpload() {
    try {
        // First, try to login, if that fails, register
        console.log('Logging in test user...');
        let token;
        try {
            const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'test@example.com',
                password: 'testpass123'
            });
            token = loginResponse.data.token;
            console.log('Logged in, got token:', token.substring(0, 20) + '...');
        } catch (loginError) {
            console.log('Login failed, registering new user...');
            const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
                username: 'testuser' + Date.now(),
                email: 'test' + Date.now() + '@example.com',
                password: 'testpass123'
            });
            token = registerResponse.data.token;
            console.log('Registered, got token:', token.substring(0, 20) + '...');
        }

        // Create a simple test file content (this won't be a real PDF, but will test the extraction)
        const testFilePath = path.join(__dirname, 'test.txt');
        fs.writeFileSync(testFilePath, 'This is test content for file extraction. It contains information about Java programming, object oriented concepts, classes, methods, and inheritance.');

        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath));
        form.append('difficulty', 'Medium');
        form.append('numQuestions', '3');
        form.append('category', 'Programming');

        console.log('Testing file upload...');

        const response = await axios.post('http://localhost:5000/api/quizzes/generate-from-file', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            timeout: 30000
        });

        console.log('Success:', response.data);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.status === 400) {
            console.log('This is expected - PDF extraction should fail for text files, and AI should fail without fallback');
        }
    }
}

testPdfUpload();