const User = require('../models/User');
const { taskProgress } = require('../middlewares/tasks');

const GetHeartShop = async (req, res) => {
    const { userId } = req.user;
    try {
        console.log('Pobieranie ceny serduszka...');
        const user = await User.findById(userId).select('extracoins, hp, hpLimit');
        if (!user) {
            console.log('Użytkownik nie znaleziony.');
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }
        res.status(200).json({
            extracoins: user.extracoins,
            hp: user.hp,
            hpLimit: user.hpLimit,
            heartCost: 5
        });
    } catch (error) {
        console.error('Błąd podczas pobierania ceny serduszka:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania ceny serduszka.' });
    }
};


const BuyHeart = async (req, res) => {
    try {
        console.log('Zakup serduszka...');
        const userId = req.user.userId;
        const heartCost = 5;

        console.log("Response status:", res.status);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        if (user.extracoins < heartCost) {
            console.log('Za mało diamencików na zakup serduszka.');
            return res.status(200).json({ message: 'Za mało diamencików na zakup serduszka.' });
        }
        console.log('Zakupiono serduszko!');

        user.extracoins -= heartCost;
        user.hp += 1;
        user.hpLimit += 1;

        await user.save();

        res.status(200).json({
            message: 'Zakupiono 1 serduszko! Twój maksymalny limit HP wzrósł.',
            remainingExtraCoins: user.extracoins,
            newHp: user.hp,
            newHpLimit: user.hpLimit, 
            success: true
        });

        taskProgress(user._id, 'heart_purchased', { heartsPurchased: 1, newHpLimit: user.hpLimit });
    } catch (error) {
        console.error('Błąd podczas zakupu serduszkaaaa:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas zakupu serduszka.' });
    }
};

module.exports = { GetHeartShop, BuyHeart };
