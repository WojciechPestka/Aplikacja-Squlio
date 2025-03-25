const disposableEmailProviders = [
    "tempmail.com", "10minutemail.com", "mailinator.com", "guerrillamail.com",
    "trashmail.com", "yopmail.com", "getnada.com"
];

function validateEmail(email) {
    const maxLength = 254;
    const sqlInjectionChars = /['";`]/;
    const mongoInjectionChars = /[$]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.length > maxLength) {
        return { valid: false, message: "Adres e-mail jest za długi (maksymalnie 254 znaki)." };
    }

    if (!emailRegex.test(email)) {
        return { valid: false, message: "Nieprawidłowy format adresu e-mail." };
    }

    if (sqlInjectionChars.test(email)) {
        return { valid: false, message: "Adres e-mail zawiera niedozwolone znaki (', \", ;, `)." };
    }

    if (mongoInjectionChars.test(email)) {
        return { valid: false, message: "Adres e-mail zawiera niedozwolone znaki ($)." };
    }
    
    const emailDomain = email.split("@")[1];
    if (disposableEmailProviders.includes(emailDomain)) {
        return { valid: false, message: "Nie można używać jednorazowych adresów e-mail." };
    }

    return { valid: true };
}

module.exports = { validateEmail };
