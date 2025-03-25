import React, { useEffect, useState } from 'react';
import './Zadania.css';

interface Task {
  id_task: number;
  title: string;
  task: string;
  possible_progress: number;
  user_progress: number;
  date: string;
}

interface ZadaniaProps {
  onClose: () => void;
}

const Zadania: React.FC<ZadaniaProps> = ({ onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/get-tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zadań');
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Błąd pobierania zadań:', error);
      setError('Nie udało się pobrać zadań.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (isLoading) {
    return <p>Ładowanie...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  const groupedTasks = [];
  for (let i = 0; i < tasks.length; i += 5) {
    groupedTasks.push(tasks.slice(i, i + 5));
  }

  return (
    <div className="popupQuest">
      <div className="vertical-line"></div>
      <button className="return-buttonQuest" onClick={onClose}>X</button>
      <div className="popup-contentQuest">
        <h2 className='zadania-title'>ZADANIA</h2>

        {tasks.length === 0 ? (
          <p>Brak dostępnych zadań.</p>
        ) : (
          <>
            <div className="task-list">
              {groupedTasks[currentGroup]?.map((task) => (
                <div key={task.id_task} className="task-item">
                  <h3>• {task.title}</h3>
                  <p>{task.task}</p>
                  <p className='progress-quest'>{task.user_progress} / {task.possible_progress}</p>
                </div>
              ))}
            </div>

            <div className="task-navigation">
              {groupedTasks.map((_, index) => (
                <button
                  key={index}
                  className={`nav-button ${currentGroup === index ? 'active' : ''}`}
                  onClick={() => setCurrentGroup(index)}
                >
                  {['I', 'II', 'III', 'IV', 'V'][index] || (index + 1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <p className='quest-info-extracoin'>Ukończ cały poziom aby otrzymać <img className='extracoin-iconQUE' src="/icons/extracoin.png" alt="extracoin-icon" /></p>
    </div>
  );
};

export default Zadania;
