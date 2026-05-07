const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

// @desc    Submit a quiz attempt
// @route   POST /api/attempts/submit
// @access  Private
const submitAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;

        if (!quizId || !answers) {
            return res.status(400).json({ message: "Quiz ID and answers are required" });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        let score = 0;
        const processedAnswers = [];

        // Calculate score
        quiz.questions.forEach((q) => {
            const userAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
            const selectedOption = userAnswer ? userAnswer.selectedOption : null;
            const isCorrect = selectedOption === q.correctAnswer;

            if (isCorrect) score++;

            processedAnswers.push({
                questionId: q._id,
                selectedOption,
                isCorrect
            });
        });

        const attempt = await Attempt.create({
            user: req.user.id,
            quiz: quizId,
            score,
            totalQuestions: quiz.questions.length,
            answers: processedAnswers,
            timeTaken: timeTaken || 0
        });

        res.status(201).json(attempt);
    } catch (error) {
        console.error("Submit Attempt Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user's attempt history
// @route   GET /api/attempts/my-history
// @access  Private
const getUserHistory = async (req, res) => {
    try {
        const history = await Attempt.find({ user: req.user.id })
            .populate('quiz', 'title category difficulty')
            .sort({ createdAt: -1 })
            .lean();

        const historyWithPercentage = history.map(attempt => ({
            ...attempt,
            percentage: (attempt.score / attempt.totalQuestions) * 100
        }));

        res.status(200).json(historyWithPercentage);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get global or quiz-specific leaderboard
// @route   GET /api/attempts/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.query;
        let query = {};
        
        if (quizId) {
            query.quiz = quizId;
        }

        const leaderboard = await Attempt.find(query)
            .populate('user', 'username')
            .populate('quiz', 'title')
            .sort({ score: -1, timeTaken: 1 })
            .limit(20);

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user productivity/performance stats
// @route   GET /api/attempts/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.user.id }).populate('quiz', 'category');
        
        if (attempts.length === 0) {
            return res.status(200).json({
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0,
                totalStudyTime: 0,
                masteredTopics: 0,
                weeklyData: [],
                topicPerformance: []
            });
        }

        const totalAttempts = attempts.length;
        const percentages = attempts.map(a => (a.score / a.totalQuestions) * 100);
        const averageScore = Math.round(percentages.reduce((a, b) => a + b, 0) / totalAttempts);
        const highestScore = Math.round(Math.max(...percentages));
        const totalStudyTime = Math.round(attempts.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0) / 3600); // in hours
        
        // Weekly Data (last 7 days)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const dayAttempts = attempts.filter(a => {
                const d = new Date(a.createdAt);
                return d.toDateString() === date.toDateString();
            });
            
            const dayScore = dayAttempts.length > 0 
                ? Math.round(dayAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / dayAttempts.length * 100)
                : 0;
                
            weeklyData.push({ day: dayName, score: dayScore, quizzes: dayAttempts.length });
        }

        // Topic Performance
        const topicDetails = {};
        attempts.forEach(a => {
            const topic = a.quiz?.category || 'General';
            if (!topicDetails[topic]) {
                topicDetails[topic] = { scores: [], total: 0 };
            }
            topicDetails[topic].scores.push((a.score / a.totalQuestions) * 100);
            topicDetails[topic].total++;
        });

        const topicPerformance = Object.keys(topicDetails).map(topic => ({
            topic,
            score: Math.round(topicDetails[topic].scores.reduce((a, b) => a + b, 0) / topicDetails[topic].total),
            total: topicDetails[topic].total
        }));

        const masteredTopics = topicPerformance.filter(t => t.score >= 90).length;

        res.status(200).json({
            totalAttempts,
            averageScore,
            highestScore,
            totalStudyTime,
            masteredTopics,
            weeklyData,
            topicPerformance
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    submitAttempt,
    getUserHistory,
    getLeaderboard,
    getUserStats
};
