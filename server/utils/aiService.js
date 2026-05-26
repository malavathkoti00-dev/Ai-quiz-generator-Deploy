const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Groq = require('groq-sdk');

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

const generateQuizWithGemini = async (prompt) => {
    // Strictly use only confirmed stable models for this project
    const modelsToTry = [
        'gemini-2.0-flash-lite', 
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest'
    ];
    let lastError;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Retry each model once if it's a 503 or 429
            for (let i = 0; i < 2; i++) {
                try {
                    console.log(`Attempting generation with ${modelName} (Try ${i + 1})...`);
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();
                    if (text) return text;
                } catch (err) {
                    lastError = err;
                    const errorMsg = err.message || "";
                    const isQuotaExceeded = err.status === 429 || errorMsg.includes("429") || errorMsg.includes("quota");
                    const isOverloaded = err.status === 503 || errorMsg.includes("503") || errorMsg.includes("overloaded");
                    
                    if (isQuotaExceeded) {
                        console.warn(`${modelName} Quota Exceeded, waiting 3s...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    }
                    if (isOverloaded) {
                        console.warn(`${modelName} Busy (503), waiting 2s...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    
                    // For 404 or other errors, stop retrying this model
                    console.error(`Model ${modelName} failed: ${err.status || err.message}`);
                    break; 
                }
            }
        } catch (setupErr) {
            console.error(`Error setting up model ${modelName}:`, setupErr.message);
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

const isKeyConfigured = (key) => {
    return key && key !== 'your_openai_api_key_here' && key !== 'your_gemini_api_key_here' && key !== 'your_groq_api_key_here';
};

const fallbackQuiz = (prompt) => ({
    title: 'Quick Practice Quiz',
    questions: [
        {
            question: 'What is the primary goal when creating an AI-generated quiz?',
            options: [
                'To ask unrelated trivia questions',
                'To generate clear questions based on the topic',
                'To provide random answers without context',
                'To ignore the requested difficulty level',
            ],
            correctAnswer: 'To generate clear questions based on the topic',
            explanation: 'A good quiz should focus on the topic and create clear, relevant questions.',
        },
        {
            question: 'Which element is required for a multiple-choice quiz question?',
            options: ['A prompt without answers', 'A single answer choice', 'A question with plausible options', 'Only the correct answer'],
            correctAnswer: 'A question with plausible options',
            explanation: 'Multiple-choice quizzes need several plausible answer options along with the correct choice.',
        },
        {
            question: 'What should a quiz explanation do?',
            options: ['Confuse the reader', 'Repeat the question exactly', 'Clarify why the correct answer is right', 'Provide an unrelated fact'],
            correctAnswer: 'Clarify why the correct answer is right',
            explanation: 'The explanation should help learners understand why the correct answer is correct.',
        },
        {
            question: 'When AI keys are not configured, the app should:',
            options: ['Fail silently', 'Show a clear error or fallback quiz', 'Continue without any response', 'Return an empty quiz'],
            correctAnswer: 'Show a clear error or fallback quiz',
            explanation: 'A resilient app should fail gracefully and still deliver a useful result when external APIs are unavailable.',
        },
        {
            question: 'Why is it useful to support multiple AI providers?',
            options: ['It makes the app slower', 'It avoids dependency on a single provider', 'It guarantees the same result every time', 'It removes the need for API keys'],
            correctAnswer: 'It avoids dependency on a single provider',
            explanation: 'Using multiple providers helps keep the feature available when one provider is unavailable or misconfigured.',
        },
    ],
});

const providerHandlers = [
    {
        name: 'gemini',
        enabled: () => genAI && isKeyConfigured(process.env.GEMINI_API_KEY),
        handler: generateQuizWithGemini,
    },
    {
        name: 'openai',
        enabled: () => openai && isKeyConfigured(process.env.OPENAI_API_KEY),
        handler: generateQuizWithOpenAI,
    },
    {
        name: 'groq',
        enabled: () => groq && isKeyConfigured(process.env.GROQ_API_KEY),
        handler: generateQuizWithGroq,
    },
];

const generateQuiz = async (prompt, options = {}) => {
    const { allowFallback = false } = options; // Disable fallback by default to avoid unrelated static quizzes
    const preferredProvider = AI_PROVIDER.toLowerCase();
    const orderedProviders = [
        ...providerHandlers.filter((provider) => provider.name === preferredProvider),
        ...providerHandlers.filter((provider) => provider.name !== preferredProvider),
    ];

    let lastError;

    for (const provider of orderedProviders) {
        if (!provider.enabled()) {
            console.log(`Provider ${provider.name} is not enabled.`);
            continue;
        }

        try {
            console.log(`Using AI provider: ${provider.name}`);
            const rawResponse = await provider.handler(prompt);
            const cleanedResponse = cleanAIResponse(rawResponse);
            return JSON.parse(cleanedResponse);
        } catch (error) {
            lastError = error;
            const errorMsg = error.message || JSON.stringify(error);
            const errorStatus = error.status || error.code || 0;
            
            console.warn(`Provider ${provider.name} failed (status: ${errorStatus}): ${errorMsg}`);
            
            const isLeakedKey = errorMsg.includes("leaked") || errorMsg.includes("API key not valid") || errorStatus === 403;
            const isRateLimited = errorStatus === 429 || /rate.*limit|quota.*exceeded|429/i.test(errorMsg);
            const isServiceUnavailable = errorStatus === 503 || /service.*unavailable|overload|503/i.test(errorMsg);
            const isInvalidKey = /invalid.*key|unauthorized|401/i.test(errorMsg);
            
            if (isLeakedKey) {
                console.error(`AI Key for ${provider.name} is LEAKED or INVALID. Please get a NEW key.`);
                lastError = new Error(`Your ${provider.name} API key is leaked or invalid. Please generate a NEW one from AI Studio.`);
                continue;
            }
            if (isRateLimited) {
                console.warn(`${provider.name} is rate-limited. Trying next provider...`);
                continue;
            }
            
            // For JSON parse errors or other non-critical errors, continue to next provider
            if (error instanceof SyntaxError) {
                console.warn(`${provider.name} returned invalid JSON. Trying next provider...`);
                continue;
            }
            
            // Continue to next provider for any error
            continue;
        }
    }

    if (allowFallback) {
        console.warn('All configured AI providers failed or unavailable. Using fallback static quiz.');
        console.warn('Last error:', lastError?.message || lastError);
        return fallbackQuiz(prompt);
    } else {
        // Throw the original error to preserve status codes like 429
        if (lastError) {
            throw lastError;
        }
        throw new Error('All AI providers failed');
    }
};

module.exports = { generateQuiz, AI_PROVIDER };
