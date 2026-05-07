const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using key:", key.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(key);
    
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
        console.log(`\nTrying model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello world in 3 words.");
            const response = await result.response;
            console.log(`Success with ${modelName}:`, response.text());
            return; // Stop if success
        } catch (err) {
            console.error(`Error with ${modelName}:`, err.message);
        }
    }
};

testGemini();
