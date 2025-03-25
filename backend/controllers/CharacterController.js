const User = require('../models/User');
const { validateUsername } = require('../utils/usernameValidation');

const Savecharacter = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Charakterystyka użytkownika');

        if (!userId) {
            return res.status(401).json({ message: 'Brak zalogowanego użytkownika' });
        }

        console.log('Dane przesłane w żądaniu:', req.body);
        const { head, body, legs, name} = req.body;

        const usernameValidation = validateUsername(name);
        if (!usernameValidation.valid) {
            return res.status(400).json({ message: usernameValidation.message });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { head, body, legs, name, editableCharacter: false }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
        }

        console.log('Zaktualizowany rekord użytkownika:', updatedUser);
        res.status(200).json({
            updatedUser, 
            message: 'Postać zapisana pomyślnie'});

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
};


module.exports = { Savecharacter };
