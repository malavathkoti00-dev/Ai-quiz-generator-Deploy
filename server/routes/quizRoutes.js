const express = require('express');
const router = express.Router();
const { 
    generateAIQuiz, 
    getAllQuizzes, 
    getMyQuizzes, 
    getQuizById,
    generateQuizFromFile 
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Generation routes (Protected)
router.post('/generate', protect, generateAIQuiz);
router.post('/generate-from-file', protect, upload.single('file'), generateQuizFromFile);

// Retrieval routes
router.get('/', getAllQuizzes);
router.get('/my-history', protect, getMyQuizzes);
router.get('/:id', getQuizById);

module.exports = router;
