const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Groq = require('groq-sdk');

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

const generateQuizWithGemini = async (prompt) => {
    // Try these models in order
    const modelsToTry = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    let lastError;

    for (const modelName of modelsToTry) {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Retry each model once if it's a 503 or 429
        for (let i = 0; i < 2; i++) {
            try {
                console.log(`Attempting generation with ${modelName} (Try ${i + 1})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (err) {
                lastError = err;
                if (err.status === 429) {
                    console.warn(`${modelName} Rate Limited (429), waiting 3s...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
                if (err.status === 503) {
                    console.warn(`${modelName} Busy (503), waiting 1s...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                // If it's a 404 or other permanent error, try the next model
                console.error(`Model ${modelName} failed with ${err.status || err.message}`);
                break; 
            }
        }
    }
    throw lastError || new Error("All AI models failed to respond.");
};

const generateQuizWithOpenAI = async (prompt) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a quiz generation assistant. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
    });
    return response.choices[0].message.content;
};

const generateQuizWithGroq = async (prompt) => {
    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'You are a quiz generation assistant. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
    });
    return response.choices[0].message.content;
};

const cleanAIResponse = (text) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return text;
        return text.substring(start, end + 1);
    } catch (e) {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
};

const generateQuiz = async (prompt) => {
    let rawResponse;
    switch (AI_PROVIDER.toLowerCase()) {
        case 'openai':
            if (!openai || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') throw new Error('OpenAI not configured');
            rawResponse = await generateQuizWithOpenAI(prompt);
            break;
        case 'groq':
            if (!groq || process.env.GROQ_API_KEY === 'your_groq_api_key_here') throw new Error('Groq not configured');
            rawResponse = await generateQuizWithGroq(prompt);
            break;
        case 'gemini':
        default:
            if (!genAI || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') throw new Error('Gemini API key is missing or invalid');
            rawResponse = await generateQuizWithGemini(prompt);
            break;
    }

    const cleanedResponse = cleanAIResponse(rawResponse);
    return JSON.parse(cleanedResponse);
};

module.exports = { generateQuiz, AI_PROVIDER };
