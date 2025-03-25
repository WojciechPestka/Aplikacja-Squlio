import React, { useEffect } from 'react';
import './StartButton.css';
import { useNavigate } from 'react-router-dom';

const StartButton: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            navigate('/menu');
        }
    }, [navigate]);

    const handleClick = () => {
        navigate('/login'); 
    };

    return (
        <div className="start-button" onClick={handleClick}>
            START
        </div>
    );
};

export default StartButton;
