import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const disposableEmailProviders = [
    "tempmail.com", "10minutemail.com", "mailinator.com", "guerrillamail.com",
    "trashmail.com", "yopmail.com", "getnada.com"
];

const validateEmail = (email: string) => {
    const maxLength = 254;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (email.length > maxLength) {
        return { valid: false, message: "Adres e-mail jest za długi (maksymalnie 254 znaki)." };
    }
    if (!emailRegex.test(email)) {
        return { valid: false, message: "Nieprawidłowy format adresu e-mail." };
    }
    const emailDomain = email.split("@")[1];
    if (disposableEmailProviders.includes(emailDomain)) {
        return { valid: false, message: "Nie można używać jednorazowych adresów e-mail." };
    }
    return { valid: true };
};

const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: "Hasło musi mieć co najmniej 8 znaków." };
    }
    if (!hasNumber) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną cyfrę." };
    }
    return { valid: true };
};

const validateCode = (code: string) => {
    if (code.length !== 6 || !/^[0-9]+$/.test(code)) {
        return { valid: false, message: "Kod powinien składać się z 6 cyfr." };
    }
    return { valid: true };
};

const ResetPassword: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [codeSent, setCodeSent] = useState(false);
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const showPopup = (message: string) => {
        setPopupMessage(message);
        setTimeout(() => setPopupMessage(null), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendCode = async () => {
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            showPopup(emailValidation.message || "Nieznany błąd walidacji e-maila.");
            return;
        }

        try {
            const response = await fetch('https://squlio.edu.pl/api/send-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();
            if (response.ok) {
                showPopup('Kod resetujący został wysłany na e-mail.');
                setCodeSent(true);
            } else {
                showPopup(`Błąd: ${data.message}`);
            }
        } catch (error) {
            console.error('Błąd wysyłania kodu:', error);
            showPopup('Wystąpił błąd. Spróbuj ponownie.');
        }
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            showPopup(emailValidation.message || "Nieznany błąd walidacji e-maila.");
            return;
        }

        const codeValidation = validateCode(formData.code);
        if (!codeValidation.valid) {
            showPopup(codeValidation.message || "Nieznany błąd walidacji kodu.");
            return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            showPopup(passwordValidation.message || "Nieznany błąd walidacji hasła.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showPopup('Hasła się nie zgadzają!');
            return;
        }

        try {
            const response = await fetch('https://squlio.edu.pl/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                showPopup('Hasło zostało zresetowane! Możesz się teraz zalogować.');
                navigate('/login');
            } else {
                showPopup(`Błąd: ${data.message}`);
            }
        } catch (error) {
            console.error('Błąd resetowania hasła:', error);
            showPopup('Wystąpił błąd. Spróbuj ponownie.');
        }
    };

    return (
        <div className="reset-password-container">
            <div className="background"></div>
            {popupMessage && <div className="popup-message show">{popupMessage}</div>}
            <div className="reset-password-box">
                <h2>Resetowanie Hasła</h2>
                <form className='formRES' onSubmit={handleResetPassword}>
                    <div className="input-group">
                        <input type="email" name="email" placeholder="Podaj e-mail" value={formData.email} onChange={handleChange} required />
                    </div>
                    {!codeSent ? (
                        <button type="button" onClick={handleSendCode}>Wyślij kod resetujący</button>
                    ) : (
                        <>
                            <div className="input-group">
                                <input type="text" name="code" placeholder="Kod potwierdzający" value={formData.code} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <input type="password" name="password" placeholder="Nowe hasło" value={formData.password} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <input type="password" name="confirmPassword" placeholder="Powtórz nowe hasło" value={formData.confirmPassword} onChange={handleChange} required />
                            </div>
                            <button type="submit">Resetuj hasło</button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;