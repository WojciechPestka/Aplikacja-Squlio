import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Background from './components/Background';
import './App.css';
import Activation from './components/ Activation';
import CharacterBuild from './components/CharacterBuild';
import MainMenu from './components/MainMenu';
import DailyQuestions from './components/DailyQuestions';
import MathQuestions from './components/MathQuestions';
import Wardrobe from './components/Wardrobe';
import ItemShop from './components/ItemShop';
import EnglishQuestions from './components/EnglishQuestions';
import ProgrammingQuestion from './components/ProgrammingQuestions';
import ScienceQuestions from './components/ScienceQuestions';
import EditUser from './components/EditUser';
import DailyStatsComponent from './components/DailyStats';
import ResetPassword from './components/ResetPassword'

const App: React.FC = () => {
    return (
        <>
            <Background />
            <Router>
                <div className="app-container">
                    <Header />
                    <Routes>
                        <Route path="/" element={<MainContent />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/activation" element={<Activation />} />
                        <Route path="/CharacterBuild" element={<CharacterBuild />} />
                        <Route path="/admin" element={<AdminDashboardWrapper />} />
                        <Route path="/menu" element={<MainMenu />} />
                        <Route path="/daily-questions" element={<DailyQuestions />} />
                        <Route path="/math-questions" element={<MathQuestions level={1} />} />
                        <Route path="/english-questions" element={<EnglishQuestions level={1} />} />
                        <Route path="/programming-questions" element={<ProgrammingQuestion level={1} />} />
                        <Route path="/science-questions" element={<ScienceQuestions level={1} />} />
                        <Route path="/item-shop" element={<ItemShop />} />
                        <Route path="/wardrobe" element={<Wardrobe />} />
                        <Route path="/edit-user/:userId" element={<EditUser />} />
                        <Route path="/dailystats/:date" element={<DailyStatsComponent />} />
                        <Route path="/dailystats/:date/:date2" element={<DailyStatsComponent />} />
                        {}

                    </Routes>
                </div>
            </Router>
        </>
    );
};

const AdminDashboardWrapper = () => {
    const location = useLocation();
    const { username, users, dailyquestions } = location.state || {};

    if (!username || !users || !dailyquestions) {
        return <div>Error: Brak wymaganych danych</div>;
    }

    return <AdminDashboard username={username} dailyquestions={dailyquestions} />;
};

export default App;
