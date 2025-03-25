function validatePassword(password) {
    const minLength = 8;
    const maxLength = 64; 
    const forbiddenChars = /['"=;`]/; 
    const mongoInjectionChars = /[$.]/; 
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: "Hasło musi mieć co najmniej 8 znaków." };
    }
    if (password.length > maxLength) {
        return { valid: false, message: "Hasło jest za długie. Maksymalna długość to 64 znaki." };
    }

    if (forbiddenChars.test(password)) {
        return { valid: false, message: "Hasło zawiera niedozwolone znaki (np. ', \", =, ;, `)." };
    }
    if (mongoInjectionChars.test(password)) {
        return { valid: false, message: "Hasło zawiera znaki niedozwolone (np. $, .)." };
    }

    if (!hasNumber) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną cyfrę." };
    }

    return { valid: true };
}

module.exports = { validatePassword };
