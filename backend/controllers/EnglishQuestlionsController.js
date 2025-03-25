const EnglishQuestion = require('../models/EnglishQuestions');
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

const getEnglishQuestion = async (req, res) => {
    const { userId } = req.user;
    try {
        console.log(`Rozpoczęto pobieranie pytania dla userId: ${userId}`);
        const user = await User.findById(userId).select('englishQuestionElo level exp coins hp extracoins name timeLeft lastHpLoss hpLimit');
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }
        if (user.hp === 0) {
            return res.status(403).json({ message: 'Masz 0 HP. Odczekaj, aż HP zostanie odnowione.' });
        }
        const level = getLevelByElo(user.englishQuestionElo);
        console.log(`ELO użytkownika: ${user.englishQuestionElo}, poziom: ${level}`);
        taskProgress(user._id, 'task_level', { taskLevel: level });

        const EnglishQuestionsDoc = await EnglishQuestion.findOne({ level });
        if (!EnglishQuestionsDoc || EnglishQuestionsDoc.questions.length === 0) {
            return res.status(404).json({ message: 'Brak dostępnych pytań dla tego poziomu.' });
        }
        const randomIndex = Math.floor(Math.random() * EnglishQuestionsDoc.questions.length);
        const randomQuestion = EnglishQuestionsDoc.questions[randomIndex];

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
                currentElo: user.englishQuestionElo,
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

const submitEnglishAnswer = async (req, res) => {
    const { userId } = req.user;
    const { questionId, answer } = req.body;
    try {
        const user = await User.findById(userId).select('englishQuestionElo coins exp level hp name extracoins correct_englishQuestion lastHpLoss hpLimit');
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }
        if (user.hp === 0) {
            return res.status(403).json({ message: 'Masz 0 HP. Odczekaj, aż HP zostanie odnowione.' });
        }
        const level = getLevelByElo(user.englishQuestionElo);
        const questionDoc = await EnglishQuestion.findOne(
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
        user.englishQuestionElo += isCorrect ? 100 : -100;
        user.englishQuestionElo = Math.max(0, user.englishQuestionElo);
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
            user.correct_englishQuestion += 1;

            if (Math.random() < 1 / 250) {
                user.extracoins += 1;
            }
        }
        const nextHpTime = moment.utc(user.lastHpLoss).tz("Europe/Warsaw");
        const now = moment().tz("Europe/Warsaw");
        const timeLeft = Math.max(0, nextHpTime.diff(now, 'milliseconds'));

        updateUserLevel(user);
        await user.save();
        taskProgress(user._id, 'level_up', { newLevel: user.level });
        console.log("wysyłana kaska " + rewards.coins)
        console.log("wysyłany xpp " + rewards.exp)

        taskProgress(user._id, 'answered_question', {
            questionDomain: "English",
            correct_englishQuestion: user.correct_englishQuestion,
            questionId,
            isCorrect,
            newElo: user.englishQuestionElo,
            newCoins: user.coins,
            newExp: user.exp,
            newLevel: user.level,
            hp: user.hp,
            hpLimit: user.hpLimit,
            timeLeft: timeLeft,
        });
        if (isCorrect) {
            taskProgress(user._id, 'earned_money', { amount: rewards.coins });
            taskProgress(user._id, 'new_difficulty', { newDifficulty: getLevelByElo(user.englishQuestionElo) });
        }
        res.status(200).json({
            correct: isCorrect,
            message: isCorrect ? 'Dobra odpowiedź!' : `Zła odpowiedź. Twoje życie zmniejszyło się do ${user.hp}.`,
            newElo: user.englishQuestionElo,
            newCoins: user.coins,
            newExp: user.exp,
            newLevel: user.level,
            hp: user.hp,
            hpLimit: user.hpLimit,
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

module.exports = { getEnglishQuestion, submitEnglishAnswer };
