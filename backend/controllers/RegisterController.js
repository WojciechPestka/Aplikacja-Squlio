const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');
const { validateUsername } = require('../utils/usernameValidation');
const { sendEmail } = require('../emailservices/emailservice');
require('dotenv').config();


const Register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            console.log('Błąd przez niepoprawne hasło');
            return res.status(400).json({ message: passwordValidation.message });
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({ message: emailValidation.message });
        }

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({ message: usernameValidation.message });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Użytkownik o podanym adresie email już istnieje' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const activationKey = generateKey();
        const userStatus = "disabled";
        const type = 'gracz';
        const head = "";

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const formattedDate = yesterday.toISOString().split('T')[0];

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            type: type,
            activationKey: activationKey,
            userStatus: userStatus,
            head: head,
            lastCompletedDate: formattedDate,
            editableCharacter: true,
        });

        await newUser.save();
        console.log('Stworzono nowego użytkownika');

        sendEmail(email, 'Konto utworzone', 'To twój kod aktywacyjny: ' + activationKey);

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );
        console.log(token)
        console.log(process.env.JWT_SECRET);
        res.status(200).json({
            message: 'Rejestracja zakończona sukcesem. Sprawdź swoją skrzynkę e-mail, aby aktywować konto.',
            token
        });
    } catch (error) {
        console.error('Błąd rejestracji użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas rejestracji użytkownika' });
    }
};

function generateKey() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { Register };
