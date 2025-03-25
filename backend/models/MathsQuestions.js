const mongoose = require('mongoose');

const MathsQuestionSchema = new mongoose.Schema({
  level: { type: Number, required: true},
  questions: [
    {
      date: { type: Date, required: true },
      id_question: { type: Number, required: true},
      question: { type: String, required: true },
      correct_answer: { type: String, required: true },
      incorrect_answer_1: { type: String, required: true },
      incorrect_answer_2: { type: String, required: true },
      incorrect_answer_3: { type: String, required: true }
    }
  ]
});

const MathsQuestion = mongoose.model('MathsQuestion', MathsQuestionSchema);

module.exports = MathsQuestion;