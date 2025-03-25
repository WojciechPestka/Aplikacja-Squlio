function validateCode(code) {
    const codeRegex = /^[0-9]{6}$/;
    const sqlInjectionChars = /['";`]/;
    const mongoInjectionChars = /[$.]/; 

    if (!codeRegex.test(code)) {
        return { valid: false, message: "Nieprawidłowy kod. Kod musi składać się z 6 cyfr." };
    }

    if (sqlInjectionChars.test(code)) {
        return { valid: false, message: "Kod zawiera niedozwolone znaki (', \", ;, `)." };
    }

    if (mongoInjectionChars.test(code)) {
        return { valid: false, message: "Kod zawiera niedozwolone znaki ($, .)." };
    }
    return { valid: true };
}

module.exports = { validateCode };
