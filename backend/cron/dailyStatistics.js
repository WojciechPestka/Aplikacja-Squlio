const cron = require('node-cron');
const User = require('../models/User');
const DailyStatistics = require('../models/DailyStatistics');
const moment = require('moment-timezone');

async function updateDailyStatistics() {
  try {
    const today = moment().tz("Europe/Warsaw").startOf('day').toDate();
    today.setHours(today.getHours() + 1);
    console.log("co jest today " + today)

    const totalUsers = await User.countDocuments();
    const completedUsers = await User.countDocuments({ completedAllQuestionsToday: true });
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    const averageElo = {
      english: await User.aggregate([{ $group: { _id: null, avg: { $avg: "$englishQuestionElo" } } }]),
      maths: await User.aggregate([{ $group: { _id: null, avg: { $avg: "$mathsQuestionElo" } } }]),
      science: await User.aggregate([{ $group: { _id: null, avg: { $avg: "$scienceQuestionElo" } } }]),
      programming: await User.aggregate([{ $group: { _id: null, avg: { $avg: "$programmingQuestionElo" } } }])
    };
    
    const avgEloScores = {
      english: averageElo.english[0]?.avg || 0,
      maths: averageElo.maths[0]?.avg || 0,
      science: averageElo.science[0]?.avg || 0,
      programming: averageElo.programming[0]?.avg || 0
    };

    const correctAnswers = {
      programming: await User.aggregate([{ $group: { _id: null, total: { $sum: "$correct_programmingQuestion" } } }]),
      maths: await User.aggregate([{ $group: { _id: null, total: { $sum: "$correct_mathsQuestion" } } }]),
      english: await User.aggregate([{ $group: { _id: null, total: { $sum: "$correct_englishQuestion" } } }]),
      science: await User.aggregate([{ $group: { _id: null, total: { $sum: "$correct_scienceQuestion" } } }])
    };

    const totalCorrectAnswers = {
      programming: correctAnswers.programming[0]?.total || 0,
      maths: correctAnswers.maths[0]?.total || 0,
      english: correctAnswers.english[0]?.total || 0,
      science: correctAnswers.science[0]?.total || 0
    };
    
    const averageLevel = await User.aggregate([{ $group: { _id: null, avg: { $avg: "$level" } } }]);
    const avgLevel = averageLevel[0]?.avg || 0;
    
    const totalCoins = await User.aggregate([{ $group: { _id: null, total: { $sum: "$coins" } } }]);
    const avgCoins = totalCoins[0]?.total / totalUsers || 0;

    const statistics = await DailyStatistics.findOneAndUpdate(
      { date: today },
      {
        date: today,
        completedUsers,
        totalUsers,
        completionRate,
        avgEloScores,
        totalCorrectAnswers,
        avgLevel,
        avgCoins
      },
      { upsert: true, new: true }
    );

    console.log("Zaktualizowano dzienne statystyki:", statistics);
  } catch (error) {
    console.error("Błąd przy aktualizacji dziennych statystyk:", error);
  }
}

cron.schedule('0 0 * * *', updateDailyStatistics, {
  timezone: "Europe/Warsaw"
});

module.exports = { updateDailyStatistics };
