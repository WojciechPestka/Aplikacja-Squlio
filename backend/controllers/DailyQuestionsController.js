const User = require('../models/User');
const DailyQuiz = require('../models/DailyQuiz');
const { taskProgress } = require('../middlewares/tasks')

const getDailyQuestion = async (req, res) => {
  try {
    console.log("Pobieranie dzisiejszego pytania...");
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuiz = await DailyQuiz.findOne({ date: today });
    if (!dailyQuiz) {
      return res.status(404).json({ message: "Brak dostępnych pytań na dziś." });
    }

    const user = await User.findById(userId).select('answeredQuestions completedAllQuestionsToday');
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie został znaleziony." });
    }

    const unansweredQuestions = dailyQuiz.questions.filter(
      (q) => !user.answeredQuestions.includes(q.id_question)
    );

    if (unansweredQuestions.length === 0) {
      taskProgress(user._id, 'finished_dailyQuiz', { unansweredQuestions: unansweredQuestions.length });
      return res.status(200).json({ message: "Ukończyłeś wszystkie dzisiejsze pytania." });
    }

    const question = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
    console.log("Zwracane pytanie:", question.id_question);
    res.status(200).json(question);

  } catch (error) {
    console.error("Błąd podczas pobierania dzisiejszego pytania:", error);
    res.status(500).json({ message: "Wystąpił błąd podczas pobierania pytania." });
  }
};

const submitAnswer = async (req, res) => {
  const { questionId, answer } = req.body;

  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('answeredQuestions completedAllQuestionsToday lastCompletedDate happines head extracoins');
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie został znaleziony." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuiz = await DailyQuiz.findOne({ date: today });
    if (!dailyQuiz) {
      return res.status(404).json({ message: "Brak dostępnych pytań na dziś." });
    }

    const question = dailyQuiz.questions.find((q) => q.id_question === questionId);
    if (!question) {
      return res.status(404).json({ message: "Pytanie nie znalezione." });
    }

    const isCorrect = question.correct_answer === answer;

    if (!user.answeredQuestions.includes(questionId)) {
      user.answeredQuestions.push(questionId);
    }

    if (user.answeredQuestions.length >= 15) {
      user.completedAllQuestionsToday = true;
      user.lastCompletedDate = today;
      user.happines = 3;
      user.extracoins += 1;
      console.log("Ukończono wszystkie dzisiejsze pytania.");

      if (user.head) {
        user.head = user.head.replace(/\/head\/[^/]+\//, "/head/happy/");
      } else {
        user.head = "/head/happy/h1_orange.png";
      }
    }

    await user.save();

    res.status(200).json({
      correct: isCorrect,
      message: isCorrect ? "Brawo! Poprawna odpowiedź!" : "Niestety, to nie jest poprawna odpowiedź."
    });

  } catch (error) {
    console.error("Błąd podczas przesyłania odpowiedzi:", error);
    res.status(500).json({ message: "Wystąpił błąd podczas przesyłania odpowiedzi." });
  }
};

module.exports = { getDailyQuestion, submitAnswer };
