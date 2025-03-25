const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DailyQuestions = require('../models/DailyQuestions');
require('dotenv').config();

const Login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        console.log("Rozpoczęcie procesu logowania");

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Użytkownik z mailem ${email} nie istnieje`);
            return res.status(401).json({ message: 'Taki użytkownik nie istnieje' });
        }
        console.log(`Znaleziono użytkownika: ${user.username}`);


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Niepoprawne hasło dla użytkownika:", user.username);
            return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
        }
        console.log("Hasło poprawne");

        user.lastLogin = moment().tz("Europe/Warsaw").toDate();
        await user.save();
        console.log(`Zaktualizowano czas ostatniego logowania dla ${user.username}`);

        const tokenExpiry = rememberMe ? '7d' : '12h';

        const token = jwt.sign(
            { userId: user._id, role: user.type },
            process.env.JWT_SECRET,
            { expiresIn: tokenExpiry }
        );
        console.log(`Token wygenerowany dla użytkownika ${user.username}:`, token);

        if (user.type === 'admin') {
            const users = await User.find();
            const dailyquestions = await DailyQuestions.find();
            console.log("Pobrano dane wszystkich użytkowników i pytań dnia");
            console.log(`Zalogował się Admin: ${user.username}`);
            return res.status(200).json({
                message: 'Zalogowano pomyślnie',
                role: 'admin',
                token,
                data: {
                    username: user.username,
                    users,
                    dailyquestions
                }
            });
        }

        if (user.userStatus === 'disabled') {
            console.log(`Konto użytkownika ${user.username} wymaga aktywacji`);
            return res.status(200).json({
                message: 'Konto wymaga aktywacji',
                role: 'user',
                view: 'activation',
                token
            });
        }

        if (!user.head) {
            console.log(`Użytkownik ${user.username} musi utworzyć postać`);
            return res.status(200).json({
                message: 'Utwórz swoją postać',
                role: 'user',
                view: 'createcharacter',
                token,
                user: { username: user.username }
            });
        }

        console.log(`Zalogował się Gracz: ${user.username}`);
        return res.status(200).json({
            message: 'Zalogowano pomyślnie',
            role: 'user',
            view: 'menu',
            token,
            data: {
                name: user.name,
                head: user.head,
                body: user.body,
                legs: user.legs
            }
        });

    } catch (error) {
        console.error('Błąd logowania użytkownika:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas logowania użytkownika' });
    }
};

module.exports = { Login };
