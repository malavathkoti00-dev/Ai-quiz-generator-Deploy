const Quiz = require("../models/Quiz");
const { extractTextFromFile } = require("../utils/extractText");
const { generateQuiz } = require("../utils/aiService");

// @desc    Generate a quiz using AI
// @route   POST /api/quizzes/generate
// @access  Private
const generateAIQuiz = async (req, res) => {
    try {
        const { topic, difficulty, numQuestions, timePerQ, category } = req.body;
        const numberOfQuestions = Number(numQuestions) || 10;
        const timePerQuestion = Number(timePerQ) || 30;

        if (!topic || !numberOfQuestions) {
            return res.status(400).json({ message: "Please provide a topic and number of questions" });
        }

        const prompt = `
            Act as an expert educator and quiz creator. Generate a high-quality, engaging quiz based on the following input: "${topic}".
            
            Requirements:
            - Difficulty: ${difficulty || 'Medium'}
            - Number of questions: ${numberOfQuestions}
            - Time per question: ${timePerQuestion} seconds
            - Category: ${category || 'General'}
            - If the input above is a short topic, use your general knowledge. If it is a long text or document content, base the questions strictly on that text.
            - The questions must be clear, concise, and test fundamental as well as nuanced understanding.
            - The incorrect options (distractors) must be plausible but definitively wrong.
            - Provide a brief, insightful explanation for why the correct answer is right.
            - Do not invent unrelated facts, filler content, or repeat unrelated trivia.
            - Return exactly ${numberOfQuestions} questions in the JSON array. Do not return more or fewer questions.

            Return the response strictly in the following JSON format without any markdown wrappers:
            {
                "title": "A relevant, catchy Quiz Title",
                "questions": [
                    {
                        "question": "Clear and specific question text?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": "The exact correct option string (must perfectly match one of the options)",
                        "explanation": "Brief explanation of the correct answer"
                    }
                ]
            }
            Ensure the JSON is perfectly valid.
        `;

        const quizData = await generateQuiz(prompt, { allowFallback: false });

        const formattedDifficulty = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) : 'Medium';
        const finalDifficulty = ['Easy', 'Medium', 'Hard', 'Mixed'].includes(formattedDifficulty) ? formattedDifficulty : 'Medium';

        // Create and save the quiz to the database
        const newQuiz = await Quiz.create({
            title: quizData.title || `${topic} Quiz`,
            category: category || 'General',
            difficulty: finalDifficulty,
            questions: quizData.questions,
            timePerQuestion,
            creator: req.user.id
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error("AI Generation Error:", error);
        
        let message = "Failed to generate quiz. Please try again.";
        if (error.status === 429) {
            message = "AI service is currently rate-limited. Please wait a moment and try again.";
        } else if (error.status === 503) {
            message = "AI service is currently overloaded. Please try again later.";
        } else if (error.status === 403 || error.status === 401 || error.message?.includes("leaked") || error.message?.includes("API key not valid")) {
            message = "Your AI API key is invalid or leaked. Please update it in the .env file.";
        } else if (error.message) {
            message = error.message;
        }

        res.status(500).json({ message, error: error.message });
    }
};

// @desc    Generate a quiz from a file (PDF/TXT)
// @route   POST /api/quizzes/generate-from-file
// @access  Private
const fs = require('fs');

const generateQuizFromFile = async (req, res) => {
    try {
        const { difficulty, numQuestions, timePerQ, category } = req.body;
        const file = req.file;
        const numberOfQuestions = Number(numQuestions) || 10;
        const timePerQuestion = Number(timePerQ) || 30;

        console.log("Received file upload:", file ? { name: file.originalname, type: file.mimetype, size: file.size } : "No file");

        if (!file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
        }

        console.log("Extracting text from file...");
        const extractedText = await extractTextFromFile(file);
        console.log("Extracted text length:", extractedText ? extractedText.length : 0);
        if (extractedText) {
            console.log("Extracted text snippet:", extractedText.substring(0, 100).replace(/\n/g, ' '));
        }
        
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract text from the uploaded file. The file may be empty, corrupted, or contain only images. Please try a different PDF or use the topic input method instead." });
        }

        const prompt = `
            Act as an expert educator and quiz creator. Based strictly on the following text content, generate a high-quality, engaging quiz.
            
            CONTENT:
            "${extractedText.substring(0, 15000)}"
            
            ---
            Requirements:
            - Difficulty: ${difficulty || 'Medium'}
            - Number of questions: ${numberOfQuestions}
            - Time per question: ${timePerQuestion} seconds
            - Category: ${category || 'General'}
            - The questions must be clear, concise, and unambiguously test the core concepts from the text.
            - The incorrect options (distractors) must be plausible but definitively wrong.
            - Provide a brief, insightful explanation for why the correct answer is right based on the text.
            - Use only the provided text content. Do not invent unrelated details or make up facts.
            - Return exactly ${numberOfQuestions} questions in the JSON array. Do not return more or fewer questions.

            Return the response strictly in the following JSON format without any markdown wrappers (e.g. do not wrap in \`\`\`json):
            {
                "title": "A relevant, catchy Quiz Title based on content",
                "questions": [
                    {
                        "question": "Clear and specific question text?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": "The exact correct option string (must perfectly match one of the options)",
                        "explanation": "Brief explanation from the context"
                    }
                ]
            }
            Ensure the JSON is perfectly valid.
        `;

        console.log("Calling AI to generate quiz from file content...");
        const quizData = await generateQuiz(prompt, { allowFallback: false });
        console.log("AI generated quiz from file:", quizData.title, "with", quizData.questions.length, "questions");

        const formattedDifficulty = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) : 'Medium';
        const finalDifficulty = ['Easy', 'Medium', 'Hard', 'Mixed'].includes(formattedDifficulty) ? formattedDifficulty : 'Medium';

        const newQuiz = await Quiz.create({
            title: quizData.title || "File Generated Quiz",
            category: category || 'General',
            difficulty: finalDifficulty,
            questions: quizData.questions,
            timePerQuestion,
            creator: req.user.id
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        const errorMsg = `File AI Generation Error at ${new Date().toISOString()}:\n${error.stack || error.message}\n\n`;
        console.error(errorMsg);
        fs.appendFileSync('error.log', errorMsg);
        
        let message = "Failed to generate quiz from file";
        if (error.status === 429) {
            message = "AI service is currently rate-limited. Please wait a moment and try again.";
        } else if (error.status === 503) {
            message = "AI service is currently overloaded. Please try again later.";
        } else if (error.status === 403 || error.status === 401 || error.message?.includes("leaked") || error.message?.includes("API key not valid")) {
            message = "Your AI API key is invalid or leaked. Please update it in the .env file.";
        } else if (error.message) {
            message = error.message;
        }
        
        res.status(500).json({ 
            message,
            error: error.message 
        });
    }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public/Private
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('creator', 'username');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user's quiz history
// @route   GET /api/quizzes/my-history
// @access  Private
const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ creator: req.user.id });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get specific quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public/Private
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('creator', 'username');
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    generateAIQuiz,
    getAllQuizzes,
    getMyQuizzes,
    getQuizById,
    generateQuizFromFile
};
