const mongoose = require('mongoose');

const dailyStatisticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalUsers: { type: Number, required: true, default: 0 },
  completedUsers: { type: Number, required: true, default: 0 },
  completionRate: { type: Number, required: true, default: 0 },
  avgEloScores: {
    english: { type: Number, required: true, default: 1000 },
    maths: { type: Number, required: true, default: 1000 },
    science: { type: Number, required: true, default: 1000 },
    programming: { type: Number, required: true, default: 1000 }
  },
  totalCorrectAnswers: {
    english: { type: Number, required: true, default: 0 },
    maths: { type: Number, required: true, default: 0 },
    science: { type: Number, required: true, default: 0 },
    programming: { type: Number, required: true, default: 0 }
  },
  avgLevel: { type: Number, required: true, default: 1 },
  avgCoins: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const DailyStatistics = mongoose.model('DailyStatistics', dailyStatisticsSchema);

module.exports = DailyStatistics;
