const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../emailservices/emailservice');
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');
const { validateCode } = require('../utils/codeValidation');

const resetCodes = new Map();

const sendResetCode = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Nie znaleziono użytkownika o tym e-mailu' });

    const resetCode = generateCode();
    resetCodes.set(email, resetCode);

    sendEmail(email, 'Kod resetowania hasła', `Twój kod: ${resetCode}`);
    console.log("wysłano email z kodem do resetu hasła " + resetCode)
    res.status(200).json({ message: 'Kod wysłany' });
};

const resetPassword = async (req, res) => {
    const { email, code, password } = req.body;

    console.log("Próba resetu hasła dla " + email + " o kodzie " + code)
    const codeValidation = validateCode(code);
    if (!codeValidation.valid) {
        return res.status(400).json({ message: codeValidation.message });
    }


    console.log("dane pobierane " + resetCodes.get(email) + " " + resetCodes.has(email));

    if (!resetCodes.has(email) || resetCodes.get(email) !== Number(code)) {
        return res.status(400).json({ message: 'Nieprawidłowy kod resetujący' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    resetCodes.delete(email);

    res.status(200).json({ message: 'Hasło zostało zresetowane' });
};

function generateCode() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { sendResetCode, resetPassword };
