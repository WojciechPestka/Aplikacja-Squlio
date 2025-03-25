const mongoose = require('mongoose');

const DailyQuizSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, 
  questions: [
    {
      id_question: { type: Number, required: true},
      question: { type: String, required: true },
      correct_answer: { type: String, required: true },
      incorrect_answer_1: { type: String, required: true },
      incorrect_answer_2: { type: String, required: true },
      incorrect_answer_3: { type: String, required: true }
    }
  ]
});

const DailyQuiz = mongoose.model('DailyQuiz', DailyQuizSchema);

module.exports = DailyQuiz;
