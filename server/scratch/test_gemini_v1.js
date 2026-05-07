const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    
    console.log("Trying v1 API with gemini-1.5-flash");
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("Success with v1:", response.text());
    } catch (err) {
        console.error("Error with v1:", err.message);
    }
};

testGemini();
