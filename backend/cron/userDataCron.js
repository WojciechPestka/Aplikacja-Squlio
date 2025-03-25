const cron = require('node-cron');
const User = require('../models/User');
const { taskProgress } = require('../middlewares/tasks')

async function resetUserProgress() {
    try {
        console.log("Cron job rozpoczęty: Aktualizacja użytkowników o północy");
        const users = await User.find();

        for (let user of users) {
            user.answeredQuestions = [];
            user.completedAllQuestionsToday = false;
            if (user.lastCompletedDate) {
                const now = new Date();
                const lastCompletedDate = new Date(user.lastCompletedDate);
                const differenceInDays = Math.floor((now - lastCompletedDate) / (1000 * 60 * 60 * 24));
                if (differenceInDays >= 2 && differenceInDays < 4) {
                    user.happines =  2; 
                    taskProgress(user._id, 'break_in_dailyQuiz', { differenceInDays: differenceInDays});
                } else if (differenceInDays >= 4) {
                    user.happines = 1; 
                }
            }

            if (user.happines === 2) {
                user.head = user.head.replace(/\/head\/[^/]+/, '/head/neutral');
            } else if (user.happines === 1) {
                user.head = user.head.replace(/\/head\/[^/]+/, '/head/sad');
            } else {
                user.head = user.head.replace(/\/head\/[^/]+/, '/head/happy');
            }

            await user.save();
        }

        console.log("Cron job zakończony: Użytkownicy zaktualizowani");
    } catch (error) {
        console.error("Błąd podczas aktualizacji użytkowników:", error);
    }
}

cron.schedule('0 0 * * *', resetUserProgress);

module.exports = { resetUserProgress };
