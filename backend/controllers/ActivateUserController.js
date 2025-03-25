const User = require('../models/User');
const { validateCode } = require('../utils/codeValidation');

const ActivateUser = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { activationKey } = req.body;
        
        console.log("Rozpoczęcie procesu aktywacji");

        const codeValidation = validateCode(activationKey);
        if (!codeValidation.valid) {
            return res.status(400).json({ message: codeValidation.message });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log(`Użytkownik o ID ${userId} nie istnieje`);
            return res.status(401).json({ message: 'Taki użytkownik nie istnieje' });
        }
        console.log(`Znaleziono użytkownika: ${user.username}`);

        if (user.activationKey !== activationKey) {
            console.log("Nieprawidłowy Kod Aktywacji");
            return res.status(401).json({ message: 'Nieprawidłowy Kod Aktywacji' });
        }
        console.log("Kod aktywacji poprawny");

        user.userStatus = 'enabled';
        await user.save();
        console.log(`Konto użytkownika ${user.username} zostało aktywowane`);

        return res.status(200).json({ message: 'Konto zostało aktywowane pomyślnie' });
        
    } catch (error) {
        console.error('Błąd aktywacji:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas aktywacji konta' });
    }
};

module.exports = { ActivateUser };
