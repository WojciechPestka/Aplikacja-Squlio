import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DailyStats.css';

interface StatsData {
    totalUsers: number;
    completedUsers: number;
    completionRate: number;
    avgEloScores: Record<string, number>;
    totalCorrectAnswers: Record<string, number>;
    avgLevel: number;
    avgCoins: number;
}

interface ComparisonData {
    [metric: string]: { [date: string]: number };
}

const DailyStatsComponent: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const { date = today } = useParams<{ date?: string }>();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [compareDate, setCompareDate] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://squlio.edu.pl/api/stats/${date}`);
                if (!response.ok) throw new Error('Błąd pobierania statystyk');
                const data: StatsData = await response.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [date]);

    const handleCompare = async () => {
        if (!compareDate) return;
        setLoading(true);
        try {
            const response = await fetch(`https://squlio.edu.pl/api/stats/compare/${date}/${compareDate}`);
            if (!response.ok) throw new Error('Błąd porównywania statystyk');
            const data: ComparisonData = await response.json();
            setComparison(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;

    const filteredComparison = comparison ? Object.entries(comparison).filter(([key]) => !['_id', 'date', '__v', 'createdAt', 'updatedAt'].includes(key)) : [];

    return (
        <div className="daily-stats">
            <h2>Statystyki dla {date}</h2>
            <input type="date" value={compareDate} onChange={(e) => setCompareDate(e.target.value)} />
            <button onClick={handleCompare}>Porównaj</button>
            {comparison ? (
                <table>
                    <thead>
                        <tr>
                            <th>Metryka</th>
                            <th>{date}</th>
                            <th>{compareDate}</th>
                            <th>Różnica</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComparison.map(([metric, values]) => (
                            <tr key={metric}>
                                <td>{metric}</td>
                                <td>{values[date] ?? 'N/A'}</td>
                                <td>{values[compareDate] ?? 'N/A'}</td>
                                <td>{values[date] !== undefined && values[compareDate] !== undefined ? (values[date] - values[compareDate]).toFixed(2) : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : stats ? (
                <div>
                    <p>Łączna liczba użytkowników: {stats.totalUsers}</p>
                    <p>Użytkownicy, którzy ukończyli zadania: {stats.completedUsers}</p>
                    <p>Wskaźnik ukończenia: {stats.completionRate}%</p>
                    <h3>Średnie Elo</h3>
                    <ul>
                        {Object.entries(stats.avgEloScores).map(([subject, score]) => (
                            <li key={subject}>{subject}: {score}</li>
                        ))}
                    </ul>
                    <h3>Poprawne odpowiedzi</h3>
                    <ul>
                        {Object.entries(stats.totalCorrectAnswers).map(([subject, correct]) => (
                            <li key={subject}>{subject}: {correct}</li>
                        ))}
                    </ul>
                    <p>Średni poziom: {stats.avgLevel}</p>
                    <p>Średnia liczba monet: {stats.avgCoins}</p>
                </div>
            ) : (
                <p>Brak dostępnych statystyk.</p>
            )}
        </div>
    );
};

export default DailyStatsComponent;