const cron = require('node-cron');
const DailyQuestions = require('../models/DailyQuestions');
const DailyQuiz = require('../models/DailyQuiz');

async function createDailyQuiz() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingQuiz = await DailyQuiz.findOne({ date: today });
    if (existingQuiz) {
      console.log("Quiz na dzisiaj już istnieje.");
      return;
    }

    const allQuestions = await DailyQuestions.find();

    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 15);

    const questionsWithIds = selectedQuestions.map((question, index) => ({
      id_question: index + 1,
      question: question.question,
      correct_answer: question.correct_answer,
      incorrect_answer_1: question.incorrect_answer_1,
      incorrect_answer_2: question.incorrect_answer_2,
      incorrect_answer_3: question.incorrect_answer_3
    }));

    const dailyQuiz = new DailyQuiz({
      date: today,
      questions: questionsWithIds
    });
    await dailyQuiz.save();
    console.log("Utworzono dzienny quiz na dziś:", today);

  } catch (error) {
    console.error("Błąd przy tworzeniu dziennego quizu:", error);
  }
}

cron.schedule('0 0 * * *', createDailyQuiz);

module.exports = { createDailyQuiz };
