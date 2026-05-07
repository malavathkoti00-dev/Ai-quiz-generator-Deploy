const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const axios = require('axios');

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        const response = await axios.get(url);
        console.log("Available models:");
        response.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (err) {
        console.error("Error listing models:", err.response ? err.response.data : err.message);
    }
};

listModels();
