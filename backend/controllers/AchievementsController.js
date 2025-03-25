const User = require('../models/User');
const Achievements = require('../models/Achievements');

const getAchievements = async (req, res) => {
    try {
        console.log("Pobieranie osiągnięć użytkownika");
        const userId = req.user.userId;
        console.log(`ID użytkownika: ${userId}`);

        const user = await User.findById(userId)
            .select('correct_programmingQuestion correct_mathsQuestion correct_englishQuestion correct_scienceQuestion')
            .lean();

        if (!user) {
            console.error("Użytkownik nie został znaleziony");
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        console.log("Dane użytkownika:", user);

        const achievements = await Achievements.find();

        if (!achievements || achievements.length === 0) {
            console.warn("Brak osiągnięć w bazie");
            return res.status(200).json({
                message: "Brak osiągnięć w systemie.",
                achievements: {}
            });
        }

        const progressFields = {
            "Poprawne odpowiedzi z Programowania": user.correct_programmingQuestion,
            "Poprawne odpowiedzi z Matematyki": user.correct_mathsQuestion,
            "Poprawne odpowiedzi z Języka Angielskiego": user.correct_englishQuestion,
            "Poprawne odpowiedzi z Przyrody": user.correct_scienceQuestion
        };


        const achievementsWithProgress = achievements.reduce((acc, achievement) => {
            const userProgress = progressFields[achievement.task] || 0;
            let currentLevel = 0;
            let nextLevelRequirement = null;
            let progressToNextLevel = null;

            console.log(`Osiągnięcie: ${achievement.task}`);
            console.log(`Postęp użytkownika: ${userProgress}`);

            if (achievement.levels && achievement.levels.length > 0) {
                for (let level = 1; level <= 5; level++) {
                    if (userProgress >= achievement.levels[0][level]) {
                        currentLevel = level;
                    } else {
                        nextLevelRequirement = achievement.levels[0][level] || 0;
                        progressToNextLevel = Math.max(0, nextLevelRequirement - userProgress);
                        break;
                    }
                }
            } else {
                console.error(`Brak poziomów dla osiągnięcia: ${achievement.task}`);
            }

            console.log(`Aktualny poziom: ${currentLevel}`);
            console.log(`Następny poziom: ${nextLevelRequirement}`);
            console.log(`Brakuje do kolejnego poziomu: ${progressToNextLevel}`);

            acc[achievement.task] = {
                userProgress,
                currentLevel,
                nextLevelRequirement,
                progressToNextLevel
            };

            return acc;
        }, {});

        res.status(200).json({
            message: "Pomyślnie pobrano osiągnięcia użytkownika",
            achievements: achievementsWithProgress
        });

    } catch (error) {
        console.error('Błąd pobierania osiągnięć użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania osiągnięć użytkownika.' });
    }
};

module.exports = { getAchievements };
