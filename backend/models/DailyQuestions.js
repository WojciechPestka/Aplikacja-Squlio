const mongoose = require('mongoose');

const DailyQuestionsSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  correct_answer: { type: String, required: true, unique: false},
  incorrect_answer_1: { type: String, required: true, unique: false},
  incorrect_answer_2: { type: String, required: true, unique: false},
  incorrect_answer_3: { type: String, required: true, unique: false},
  createdAt: { type: Date, default: Date.now }
});

const DailyQuestions = mongoose.model('DailyQuestions', DailyQuestionsSchema);

module.exports = DailyQuestions;
