import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const forbiddenUsernames = ["admin", "root", "superuser", "test", "user", "guest"];
const disposableEmailProviders = [
    "tempmail.com", "10minutemail.com", "mailinator.com", "guerrillamail.com",
    "trashmail.com", "yopmail.com", "getnada.com"
];

const validateUsername = (username: string) => {
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
    if (sqlInjectionChars.test(username) || mongoInjectionChars.test(username)) {
        return { valid: false, message: "Nazwa użytkownika zawiera niedozwolone znaki." };
    }
    if (forbiddenUsernames.includes(username.toLowerCase())) {
        return { valid: false, message: "Ta nazwa użytkownika jest zarezerwowana." };
    }
    return { valid: true };
};

const validatePassword = (password: string) => {
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
    if (forbiddenChars.test(password) || mongoInjectionChars.test(password)) {
        return { valid: false, message: "Hasło zawiera niedozwolone znaki." };
    }
    if (!hasNumber) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną cyfrę." };
    }
    return { valid: true };
};

const validateEmail = (email: string) => {
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
    if (sqlInjectionChars.test(email) || mongoInjectionChars.test(email)) {
        return { valid: false, message: "Adres e-mail zawiera niedozwolone znaki." };
    }
    const emailDomain = email.split("@")[1];
    if (disposableEmailProviders.includes(emailDomain)) {
        return { valid: false, message: "Nie można używać jednorazowych adresów e-mail." };
    }
    return { valid: true };
};

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (popupMessage) {
            const timer = setTimeout(() => {
                setPopupMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [popupMessage]);

    const showPopup = (message: string) => {
        setPopupMessage(message);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const usernameValidation = validateUsername(formData.username);
        if (!usernameValidation.valid) {
            showPopup(usernameValidation.message || "Nieznany błąd walidacji nazwy użytkownika.");
            return;
        }

        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            showPopup(emailValidation.message || "Nieznany błąd walidacji e-maila.");
            return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            showPopup(passwordValidation.message || "Nieznany błąd walidacji hasła.");
            return;
        }

        try {
            const response = await fetch('https://squlio.edu.pl/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Token otrzymany po rejestracji:", data.token);
                localStorage.setItem("authToken", data.token);
                navigate('/activation');
            } else {
                showPopup(`Błąd: ${data.message}`);
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas rejestracji:', error);
            showPopup('Wystąpił błąd. Spróbuj ponownie.');
        }
    };

    return (
        <div className="register-container">
            <div className="background"></div>
            {popupMessage && <div className="popup-message show">{popupMessage}</div>}
            <div className="register-box">
                <h2>REJESTRACJA</h2>
                <form id='log123' onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="username"
                            placeholder="Nazwa użytkownika" 
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="email" 
                            name="email"
                            placeholder="e-mail" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="hasło" 
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">ZAREJESTRUJ SIĘ</button>
                </form>
                <p>Masz już konto? <a href="/login">Zaloguj się</a></p>
            </div>
        </div>
    );
};

export default Register;
