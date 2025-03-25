const User = require('../models/User');

const calculateRequiredExp = (level) => {
    const baseExp = 200;
    const levelMultiplier = 1.5;
    if (level === 1) return 0;
    return Math.floor(baseExp * Math.pow(levelMultiplier, level - 2));
};

const getUserStats = async (req, res) => {
    const { userId } = req.user;

    try {
        const user = await User.findById(userId).select('level');
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }

        const requiredExpForNextLevel = calculateRequiredExp(user.level + 1);

        res.status(200).json({
            currentLevel: user.level,
            requiredExpForNextLevel,
        });
    } catch (err) {
        console.error('Błąd przy pobieraniu danych użytkownika:', err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania danych.' });
    }
};

module.exports = { getUserStats };
