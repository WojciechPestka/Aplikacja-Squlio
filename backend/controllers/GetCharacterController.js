const User = require('../models/User');
const ItemShop = require('../models/ItemShop');
const { taskProgress } = require('../middlewares/tasks')
const moment = require('moment-timezone');


const getCharacter = async (req, res) => {
    try {
        console.log("Ekran główny");
        const userId = req.user.userId; 
        console.log("Rozpoczęto pobieranie danych użytkownika");

        const user = await User.findById(userId).select('name head body legs level coins exp extracoins hp happines headSkin armSkin legSkin englishQuestionElo mathsQuestionElo scienceQuestionElo programmingQuestionElo lastHpLoss hpLimit');

        const countHighElo = (user) => {
            const { englishQuestionElo, mathsQuestionElo, scienceQuestionElo, programmingQuestionElo } = user;
            const threshold = 3500;
        
            return [englishQuestionElo, mathsQuestionElo, scienceQuestionElo, programmingQuestionElo].filter(elo => elo > threshold).length;
        };

        taskProgress(user._id, 'high_elo', { HighElo: countHighElo(user) });

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        const headItem = user.headSkin ? await ItemShop.findOne({ id: user.headSkin }) : null;
        const armItem = user.armSkin ? await ItemShop.findOne({ id: user.armSkin }) : null;
        const legItem = user.legSkin ? await ItemShop.findOne({ id: user.legSkin }) : null;



        const nextHpTime = moment.utc(user.lastHpLoss).tz("Europe/Warsaw");
        const now = moment().tz("Europe/Warsaw");
        const timeLeft = Math.max(0, nextHpTime.diff(now, 'milliseconds'));
        
        console.log("Ostatnie stracenie HP:", user.lastHpLoss);
        console.log("Kiedy powinno dać nowe serduszko:", nextHpTime.format());
        console.log("Aktualny czas:", now.format());
        console.log("Wysłany time left:", timeLeft);
        
        
        res.status(200).json({
            name: user.name,
            head: user.head, 
            body: user.body,
            legs: user.legs,
            level: user.level,
            coins: user.coins,
            exp: user.exp,
            extracoins: user.extracoins,
            hp: user.hp,
            hpLimit: user.hpLimit,
            timeLeft: timeLeft,
            happiness: user.happines,
            equippedItems: {
                head: headItem ? { id: headItem.id, name: headItem.name, url: headItem.url } : null,
                arm: armItem ? { id: armItem.id, name: armItem.name, url: armItem.url } : null,
                leg: legItem ? { id: legItem.id, name: legItem.name, url: legItem.url } : null,
            },
        });
    } catch (error) {
        console.error('Błąd pobierania danych postaci:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania danych postaci.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query).select('name email');
        res.status(200).json(users);
    } catch (error) {
        console.error('Błąd pobierania listy użytkowników:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania użytkowników.' });
    }
};


const getAllUserData = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password'); 
        
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Błąd pobierania danych użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania danych użytkownika.' });
    }
};

const updateUserData = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        res.status(200).json({ message: 'Dane użytkownika zostały zaktualizowane.', user });
    } catch (error) {
        console.error('Błąd aktualizacji danych użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji danych użytkownika.' });
    }
};


module.exports = { getCharacter, getAllUsers, getAllUserData, updateUserData };
