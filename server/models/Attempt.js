const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: [
        {
            questionId: mongoose.Schema.Types.ObjectId,
            selectedOption: String,
            isCorrect: Boolean
        }
    ],
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', attemptSchema);
module.exports = Attempt;
