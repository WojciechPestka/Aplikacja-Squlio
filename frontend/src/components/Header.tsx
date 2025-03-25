import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <Link to="/" className="logo">SQULIO</Link>
        </header>
    );
};

export default Header;
