const Quiz = require("../models/Quiz");
const { extractTextFromFile } = require("../utils/extractText");
const { generateQuiz } = require("../utils/aiService");

// @desc    Generate a quiz using AI
// @route   POST /api/quizzes/generate
// @access  Private
const generateAIQuiz = async (req, res) => {
    try {
        const { topic, difficulty, numQuestions, category } = req.body;

        if (!topic || !numQuestions) {
            return res.status(400).json({ message: "Please provide a topic and number of questions" });
        }

        const prompt = `
            Act as an expert educator and quiz creator. Generate a high-quality, engaging quiz on the topic: "${topic}".
            
            Requirements:
            - Difficulty: ${difficulty || 'Medium'}
            - Number of questions: ${numQuestions}
            - Category: ${category || 'General'}
            - The questions must be clear, concise, and test fundamental as well as nuanced understanding of the topic.
            - The incorrect options (distractors) must be plausible but definitively wrong.
            - Provide a brief, insightful explanation for why the correct answer is right.

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

        const quizData = await generateQuiz(prompt);

        const formattedDifficulty = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) : 'Medium';
        const finalDifficulty = ['Easy', 'Medium', 'Hard'].includes(formattedDifficulty) ? formattedDifficulty : 'Medium';

        // Create and save the quiz to the database
        const newQuiz = await Quiz.create({
            title: quizData.title || `${topic} Quiz`,
            category: category || 'General',
            difficulty: finalDifficulty,
            questions: quizData.questions,
            creator: req.user.id
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate quiz", error: error.message });
    }
};

// @desc    Generate a quiz from a file (PDF/TXT)
// @route   POST /api/quizzes/generate-from-file
// @access  Private
const fs = require('fs');

const generateQuizFromFile = async (req, res) => {
    try {
        const { difficulty, numQuestions, category } = req.body;
        const file = req.file;

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
            return res.status(400).json({ message: "Could not extract text from PDF. The file may be empty or corrupted." });
        }

        const prompt = `
            Act as an expert educator and quiz creator. Based strictly on the following text content, generate a high-quality, engaging quiz.
            
            CONTENT:
            "${extractedText.substring(0, 15000)}"
            
            ---
            Requirements:
            - Difficulty: ${difficulty || 'Medium'}
            - Number of questions: ${numQuestions || 5}
            - Category: ${category || 'General'}
            - The questions must be clear, concise, and unambiguously test the core concepts from the text.
            - The incorrect options (distractors) must be plausible but definitively wrong.
            - Provide a brief, insightful explanation for why the correct answer is right based on the text.

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

        console.log("Calling AI to generate quiz...");
        const quizData = await generateQuiz(prompt);
        console.log("AI generated quiz:", quizData.title, "with", quizData.questions.length, "questions");

        const formattedDifficulty = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) : 'Medium';
        const finalDifficulty = ['Easy', 'Medium', 'Hard'].includes(formattedDifficulty) ? formattedDifficulty : 'Medium';

        const newQuiz = await Quiz.create({
            title: quizData.title || "File Generated Quiz",
            category: category || 'General',
            difficulty: finalDifficulty,
            questions: quizData.questions,
            creator: req.user.id
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        const errorMsg = `File AI Generation Error at ${new Date().toISOString()}:\n${error.stack || error.message}\n\n`;
        console.error(errorMsg);
        fs.appendFileSync('error.log', errorMsg);
        
        let message = "Failed to generate quiz from file";
        if (error.status === 429) {
            message = "AI service is currently rate-limited (Free Tier). Please wait 30 seconds and try again.";
        } else if (error.status === 503) {
            message = "AI service is currently overloaded. Please try again in a few moments.";
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
