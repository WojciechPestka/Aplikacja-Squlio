import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface User {
    _id: string;
    username: string;
    email: string;
    type?: string;
    userStatus: string;
    coins: number;
    level: number;
    exp: number;
    hp: number;
    happines: number;
    englishQuestionElo: number;
    mathsQuestionElo: number;
    scienceQuestionElo: number;
    programmingQuestionElo: number;
    [key: string]: any;
}

const EditUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`https://squlio.edu.pl/get-user-data/${userId}`);
                const data = await response.json();
                if (response.ok) {
                    setUser(data);
                } else {
                    console.error('Błąd:', data.message);
                }
            } catch (error) {
                console.error('Wystąpił błąd:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (user) {
            setUser({ ...user, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://squlio.edu.pl/update-user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            if (response.ok) {
                alert('Dane użytkownika zostały zaktualizowane.');
            } else {
                const data = await response.json();
                alert(`Błąd: ${data.message}`);
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    if (loading) return <p>Ładowanie danych użytkownika...</p>;
    if (!user) return <p>Nie znaleziono użytkownika.</p>;

    return (
        <div className="EditUser">
            <h2>Edycja danych użytkownika: {user.username}</h2>
            <form onSubmit={handleSubmit}>
                <p>Nazwa urzytkownika</p>
                <input type="text" name="username" value={user.username} onChange={handleChange} required />
                <p>Email urzytkownika</p>
                <input type="email" name="email" value={user.email} onChange={handleChange} required />
                <p>Status urzytkownika</p>
                <input type="text" name="userStatus" value={user.userStatus} onChange={handleChange} />
                <p>Ilość Coinsów</p>
                <input type="number" name="coins" value={user.coins} onChange={handleChange} />
                <p>Popziom urzytkownika</p>
                <input type="number" name="level" value={user.level} onChange={handleChange} />
                <p>EXP</p>
                <input type="number" name="exp" value={user.exp} onChange={handleChange} />
                <p>Poziom HP</p>
                <input type="number" name="hp" value={user.hp} onChange={handleChange} />
                <p>Poziom szczęścia</p>
                <input type="number" name="happines" value={user.happines} onChange={handleChange} />
                <p>Elo pytań z angielskiego</p>
                <input type="number" name="englishQuestionElo" value={user.englishQuestionElo} onChange={handleChange} />
                <p>Elo pytań z matematyki</p>
                <input type="number" name="mathsQuestionElo" value={user.mathsQuestionElo} onChange={handleChange} />
                <p>Elo pytań z przyrody</p>
                <input type="number" name="scienceQuestionElo" value={user.scienceQuestionElo} onChange={handleChange} />
                <p>Elo pytań z progamowania</p>
                <input type="number" name="programmingQuestionElo" value={user.programmingQuestionElo} onChange={handleChange} />
                <button type="submit">Zapisz zmiany</button>
            </form>
        </div>
    );
};

export default EditUser;
