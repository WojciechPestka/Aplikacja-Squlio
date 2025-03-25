import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

interface AdminDashboardProps {
    username: string;
    dailyquestions: Array<{
        question: string;
        correct_answer: string;
        incorrect_answer_1: string;
        incorrect_answer_2: string;
        incorrect_answer_3: string;
    }>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ dailyquestions }) => {
    const [questionType, setQuestionType] = useState('maths');
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        correct_answer: '',
        incorrect_answer_1: '',
        incorrect_answer_2: '',
        incorrect_answer_3: '',
        level: '',
        date: '',
        id_question: '',
    });

    const [newShopItem, setNewShopItem] = useState({
        id: '',
        type: '',
        url: '',
        requiredLevel: '',
        cost: '',
        name: ''
    });
    const [users, setUsers] = useState<Array<any>>([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://squlio.edu.pl/get-all-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ search })
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                console.error('Błąd pobierania użytkowników:', data.message);
            }
        } catch (error) {
            console.error('Wystąpił błąd:', error);
        }
    };

    const handleEditUser = (userId: string) => {
        navigate(`/edit-user/${userId}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewQuestion({
            ...newQuestion,
            [e.target.name]: e.target.value,
        });
    };

    const handleShopItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewShopItem({
            ...newShopItem,
            [e.target.name]: e.target.value,
        });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuestionType(e.target.value);
    };

    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const endpointMap: { [key: string]: string } = {
            maths: 'https://squlio.edu.pl/CreateMathsQuestion',
            programming: 'https://squlio.edu.pl/CreateProgrammingQuestion',
            science: 'https://squlio.edu.pl/CreateScienceQuestion',
            english: 'https://squlio.edu.pl/CreateEnglishQuestion',
        };

        try {
            const response = await fetch(endpointMap[questionType], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newQuestion,
                    level: Number(newQuestion.level),
                    date: new Date(newQuestion.date),
                }),
            });

            if (response.ok) {
                alert(`Dodano nowe pytanie z kategorii: ${questionType}`);
                setNewQuestion({
                    question: '',
                    correct_answer: '',
                    incorrect_answer_1: '',
                    incorrect_answer_2: '',
                    incorrect_answer_3: '',
                    level: '',
                    date: '',
                    id_question: '',
                });
            } else {
                const data = await response.json();
                alert(`Błąd: ${data.message || 'Nieznany błąd serwera'}`);
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const handleSubmitShopItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('https://squlio.edu.pl/CreateShopItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newShopItem,
                    requiredLevel: Number(newShopItem.requiredLevel),
                    cost: Number(newShopItem.cost),
                }),
            });

            if (response.ok) {
                alert('Dodano nowy przedmiot do sklepu!');
                setNewShopItem({
                    id: '',
                    type: '',
                    url: '',
                    requiredLevel: '',
                    cost: '',
                    name: ''
                });
            } else {
                const data = await response.json();
                alert(`Błąd: ${data.message || 'Nieznany błąd serwera'}`);
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    
    return (
        <div className="AdminDashboard">
            <h2>Dodaj nowe pytanie</h2>
            <select value={questionType} onChange={handleTypeChange}>
                <option value="maths">Matematyka</option>
                <option value="programming">Programowanie</option>
                <option value="science">Nauki ścisłe</option>
                <option value="english">Język angielski</option>
            </select>

            <form className='formAD' onSubmit={handleSubmit}>
                <input type="text" name="question" placeholder="Pytanie" value={newQuestion.question} onChange={handleChange} required />
                <input type="text" name="correct_answer" placeholder="Poprawna odpowiedź" value={newQuestion.correct_answer} onChange={handleChange} required />
                <input type="text" name="incorrect_answer_1" placeholder="Błędna odpowiedź 1" value={newQuestion.incorrect_answer_1} onChange={handleChange} required />
                <input type="text" name="incorrect_answer_2" placeholder="Błędna odpowiedź 2" value={newQuestion.incorrect_answer_2} onChange={handleChange} required />
                <input type="text" name="incorrect_answer_3" placeholder="Błędna odpowiedź 3" value={newQuestion.incorrect_answer_3} onChange={handleChange} required />
                <input type="number" name="level" placeholder="Poziom trudności" value={newQuestion.level} onChange={handleChange} required />
                <input type="date" name="date" placeholder="Data" value={newQuestion.date} onChange={handleChange} required />
                <input type="number" name="id_question" placeholder="ID pytania" value={newQuestion.id_question} onChange={handleChange} required />

                <button type="submit">Dodaj pytanie</button>
            </form>

            <h2>Dodaj nowy przedmiot do sklepu</h2>
            <form className='formAD' onSubmit={handleSubmitShopItem}>
                <input type="text" name="id" placeholder="ID przedmiotu" value={newShopItem.id} onChange={handleShopItemChange} required />
                <input type="text" name="type" placeholder="Typ przedmiotu" value={newShopItem.type} onChange={handleShopItemChange} required />
                <input type="text" name="name" placeholder="Nazwa przedmiotu" value={newShopItem.name} onChange={handleShopItemChange} required />
                <input type="text" name="url" placeholder="URL przedmiotu" value={newShopItem.url} onChange={handleShopItemChange} required />
                <input type="number" name="requiredLevel" placeholder="Wymagany poziom" value={newShopItem.requiredLevel} onChange={handleShopItemChange} required />
                <input type="number" name="cost" placeholder="Koszt" value={newShopItem.cost} onChange={handleShopItemChange} required />

                <button type="submit">Dodaj przedmiot</button>
            </form>

            <h2>Użytkownicy</h2>
            <input className='input_user_search' type="text" placeholder="Szukaj użytkownika" value={search} onChange={(e) => setSearch(e.target.value)} />

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Imię</th>
                        <th>Email</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <button id="do_edycji" onClick={() => handleEditUser(user._id)}>Edytuj</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className='user_stats_b'onClick={() => navigate(`/dailystats/${today}`)} title="DailyStats">
                Statystyki Graczy
            </button>

            <h2>Pytania Dnia</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pytanie</th>
                        <th>Poprawna odpowiedź</th>
                        <th>Błędna odpowiedź 1</th>
                        <th>Błędna odpowiedź 2</th>
                        <th>Błędna odpowiedź 3</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyquestions.map((question, index) => (
                        <tr key={index}>
                            <td>{question.question}</td>
                            <td>{question.correct_answer}</td>
                            <td>{question.incorrect_answer_1}</td>
                            <td>{question.incorrect_answer_2}</td>
                            <td>{question.incorrect_answer_3}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
