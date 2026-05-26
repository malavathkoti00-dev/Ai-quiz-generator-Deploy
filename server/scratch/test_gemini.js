const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];
    
    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`Success with ${modelName}: ${response.text()}`);
        } catch (err) {
            console.error(`Error with ${modelName}: ${err.message}`);
        }
    }
}

testGemini();
