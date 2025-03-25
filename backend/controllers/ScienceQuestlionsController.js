const ScienceQuestion = require('../models/ScienceQuestions');
const User = require('../models/User');
const { taskProgress } = require('../middlewares/tasks');
const moment = require('moment-timezone');

const getLevelByElo = (elo) => {
    console.log('Obliczanie poziomu na podstawie ELO:', elo);
    if (elo >= 3500) return 5;
    if (elo >= 2500) return 4;
    if (elo >= 2000) return 3;
    if (elo >= 1500) return 2;
    return 1;
};

const calculateRequiredExp = (level) => {
    const baseExp = 200;
    const levelMultiplier = 1.5;
    if (level === 1) return 0;
    return Math.floor(baseExp * Math.pow(levelMultiplier, level - 2));
};

const updateUserLevel = (user) => {
    let requiredExp = calculateRequiredExp(user.level + 1);
    console.log("Ile exp brakuje: " + requiredExp);

    while (user.exp >= requiredExp) {
        user.level += 1;
        user.exp -= requiredExp;
        requiredExp = calculateRequiredExp(user.level + 1);
        console.log(`Awans na poziom ${user.level}. Pozostałe exp: ${user.exp}`);
    }
    return user;
};

const getScienceQuestion = async (req, res) => {
    const { userId } = req.user;
    try {
        console.log(`Rozpoczęto pobieranie pytania dla userId: ${userId}`);

        const user = await User.findById(userId).select('scienceQuestionElo level exp coins hp extracoins name lastHpLoss hpLimit');
        if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });

        if (user.hp === 0) {
            return res.status(403).json({ message: 'Masz 0 HP. Odczekaj, aż HP zostanie odnowione.' });
        }

        const level = getLevelByElo(user.scienceQuestionElo);
        console.log(`ELO użytkownika: ${user.scienceQuestionElo}, poziom: ${level}`);
        taskProgress(user._id, 'task_level', { taskLevel: level });

        const scienceQuestionsDoc = await ScienceQuestion.findOne({ level });
        if (!scienceQuestionsDoc || scienceQuestionsDoc.questions.length === 0) {
            return res.status(404).json({ message: 'Brak dostępnych pytań dla tego poziomu.' });
        }

        const randomIndex = Math.floor(Math.random() * scienceQuestionsDoc.questions.length);
        const randomQuestion = scienceQuestionsDoc.questions[randomIndex];

        const nextHpTime = moment.utc(user.lastHpLoss).tz("Europe/Warsaw");
        const now = moment().tz("Europe/Warsaw");
        const timeLeft = Math.max(0, nextHpTime.diff(now, 'milliseconds'));

        res.status(200).json({
            question: randomQuestion,
            userStats: {
                currentLevel: user.level,
                currentExp: user.exp,
                requiredExpForNextLevel: calculateRequiredExp(user.level + 1),
                currentCoins: user.coins,
                currentElo: user.scienceQuestionElo,
                currentHp: user.hp,
                hpLimit: user.hpLimit,
                extracoins: user.extracoins,
                name: user.name,
                timeLeft: timeLeft,
                taskLevel: level,
            },
        });
    } catch (err) {
        console.error('Błąd podczas pobierania pytania:', err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania pytania.' });
    }
};

const submitScienceAnswer = async (req, res) => {
    const { userId } = req.user;
    const { questionId, answer } = req.body;

    try {
        const user = await User.findById(userId).select('scienceQuestionElo coins exp level hp name extracoins correct_scienceQuestion lastHpLoss hpLimit');
        if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });

        if (user.hp === 0) {
            return res.status(403).json({ message: 'Masz 0 HP. Odczekaj, aż HP zostanie odnowione.' });
        }

        const level = getLevelByElo(user.scienceQuestionElo);

        const questionDoc = await ScienceQuestion.findOne(
            { level, 'questions.id_question': questionId },
            { 'questions.$': 1 }
        );

        if (!questionDoc) {
            return res.status(404).json({ message: 'Pytanie nie znalezione.' });
        }

        const question = questionDoc.questions[0];
        const isCorrect = answer === question.correct_answer;

        if (!isCorrect) {
            if (user.hp > 0) {
                user.hp = Math.max(0, user.hp - 1);
                const now = moment().tz("Europe/Warsaw").toDate();
                now.setHours(now.getHours() + 1);

                user.lastHpLoss = now;
            }
        }

        user.scienceQuestionElo += isCorrect ? 100 : -100;
        user.scienceQuestionElo = Math.max(0, user.scienceQuestionElo);

        let rewards = { coins: 0, exp: 0 };

        if (isCorrect) {
            const rewardTable = [
                { coins: 5, exp: 50 },
                { coins: 10, exp: 75 },
                { coins: 15, exp: 100 },
                { coins: 25, exp: 170 },
                { coins: 40, exp: 250 },
            ];

            rewards = rewardTable[level - 1];
            user.coins += rewards.coins;
            user.exp += rewards.exp;
            user.correct_scienceQuestion += 1;

            if (Math.random() < 1 / 250) {
                user.extracoins += 1;
            }
        }

        updateUserLevel(user);
        await user.save();
        taskProgress(user._id, 'level_up', { newLevel: user.level });

        const nextHpTime = moment.utc(user.lastHpLoss).tz("Europe/Warsaw");
        const now = moment().tz("Europe/Warsaw");
        const timeLeft = Math.max(0, nextHpTime.diff(now, 'milliseconds'));

        taskProgress(user._id, 'answered_question', {
            questionDomain: "Science",
            correct_scienceQuestion: user.correct_scienceQuestion,
            questionId,
            isCorrect,
            newElo: user.scienceQuestionElo,
            newCoins: user.coins,
            newExp: user.exp,
            newLevel: user.level,
            hp: user.hp,
            hplimit: user.hpLimit,
            timeLeft: timeLeft,
        });

        if (isCorrect) {
            taskProgress(user._id, 'earned_money', { amount: rewards.coins });
            taskProgress(user._id, 'new_difficulty', { newDifficulty: getLevelByElo(user.scienceQuestionElo) });
        }

        res.status(200).json({
            correct: isCorrect,
            message: isCorrect
                ? 'Dobra odpowiedź!'
                : `Zła odpowiedź. Twoje życie zmniejszyło się do ${user.hp}.`,
            newElo: user.scienceQuestionElo,
            newCoins: user.coins,
            newExp: user.exp,
            newLevel: user.level,
            hp: user.hp,
            hplimit: user.hpLimit,
            timeLeft: timeLeft,
            name: user.name,
            extracoins: user.extracoins,
            addcoin: rewards.coins,
            requiredExpForNextLevel: calculateRequiredExp(user.level + 1),
        });
    } catch (err) {
        console.error('Błąd przy przesyłaniu odpowiedzi:', err);
        res.status(500).json({ message: 'Błąd serwera podczas przesyłania odpowiedzi.' });
    }
};

module.exports = { getScienceQuestion, submitScienceAnswer };
