const mongoose = require('mongoose');

const ProgramingQuestionSchema = new mongoose.Schema({
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

const ProgramingQuestion = mongoose.model('ProgramingQuestion', ProgramingQuestionSchema);

module.exports = ProgramingQuestion;