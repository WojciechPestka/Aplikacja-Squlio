const mongoose = require('mongoose');

const AchievementsShema = new mongoose.Schema({
    task: { type: String, required: true },
    levels: [
    {
      1: { type: Number, required: true, default: 50},
      2: { type: Number, required: true, default: 100},
      3: { type: Number, required: true, default: 200},
      4: { type: Number, required: true, default: 500},
      5: { type: Number, required: true, default: 1000},
    }
  ]
});

const Achievements = mongoose.model('Achievements', AchievementsShema);

module.exports = Achievements;