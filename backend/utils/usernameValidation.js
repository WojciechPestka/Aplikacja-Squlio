const forbiddenUsernames = ["admin", "root", "superuser", "test", "user", "guest"];

function validateUsername(username) {
    const minLength = 3;
    const maxLength = 20;
    const usernameRegex = /^[a-zA-Z0-9_-]+$/; 
    const sqlInjectionChars = /['";`]/; 
    const mongoInjectionChars = /[$.]/;

    if (username.length < minLength) {
        return { valid: false, message: "Nazwa użytkownika musi mieć co najmniej 3 znaki." };
    }
    if (username.length > maxLength) {
        return { valid: false, message: "Nazwa użytkownika jest za długa (maksymalnie 20 znaków)." };
    }


    if (!usernameRegex.test(username)) {
        return { valid: false, message: "Nazwa użytkownika może zawierać tylko litery, cyfry, _ i -." };
    }


    if (sqlInjectionChars.test(username)) {
        return { valid: false, message: "Nazwa użytkownika zawiera niedozwolone znaki (', \", ;, `)." };
    }

    if (mongoInjectionChars.test(username)) {
        return { valid: false, message: "Nazwa użytkownika zawiera niedozwolone znaki ($, .)." };
    }

    if (forbiddenUsernames.includes(username.toLowerCase())) {
        return { valid: false, message: "Ta nazwa użytkownika jest zarezerwowana." };
    }

    return { valid: true };
}

module.exports = { validateUsername };
