const express = require('express');
const router = express.Router();
const {
    submitAttempt,
    getUserHistory,
    getLeaderboard,
    getUserStats
} = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitAttempt);
router.get('/my-history', protect, getUserHistory);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', protect, getUserStats);

module.exports = router;
