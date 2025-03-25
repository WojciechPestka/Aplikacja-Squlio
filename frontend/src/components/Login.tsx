import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './Background.css';

const Login: React.FC = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
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
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(e.target.checked);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('https://squlio.edu.pl/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Token otrzymany po logowaniu:", data.token);

                if (rememberMe) {
                    localStorage.setItem("authToken", data.token);
                    console.log("Zapisany w localStorage")
                } else {
                    sessionStorage.setItem("authToken", data.token);
                    console.log("Zapisany w sessionStorage")
                }

                if (data.role === 'admin') {
                    navigate('/admin', { state: data.data });
                } else if (data.view === 'activation') {
                    navigate('/activation', { state: data });
                } else if (data.view === 'createcharacter') {
                    navigate('/CharacterBuild', { state: data });
                } else if (data.view === 'menu') {
                    navigate('/menu', { state: data.data });
                }
            } else {
                showPopup(`Błąd logowania: ${data.message}`);
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas logowania:', error);
            showPopup('Wystąpił błąd podczas logowania.');
        }
    };

    return (
        <div className="login-container">
            <div className="background"></div>
            {popupMessage && <div className="popup-message show">{popupMessage}</div>}
            <div className="login-box">
                <h2>LOGOWANIE</h2>
                <form id='log123' onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="e-mail"
                            value={loginData.email}
                            onChange={handleChange}
                            required
                        />
                        <span className="icon"></span>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="hasło"
                            value={loginData.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="icon"></span>
                    </div>
                    <div className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                        />
                        <label>zapamiętaj mnie</label>
                    </div>
                    <p>Zapomniałeś hasło? <a href="/reset-password">Resetuj Hasło</a></p>
                    <button type="submit">LOGOWANIE</button>
                </form>
                <p>Nie masz konta? <a href="/register">Zarejestruj się</a></p>
            </div>
        </div>
    );
};
export default Login;
