import React, { useEffect, useState } from 'react';
import './Achivments.css';

interface AchievementProgress {
  userProgress: number;
  currentLevel: number;
  nextLevelRequirement: number | null;
  progressToNextLevel: number | null;
}

type AchievementsData = Record<string, AchievementProgress>;

const achievementIcons: Record<string, string> = {
  "Poprawne odpowiedzi z Programowania": "AchiPRO",
  "Poprawne odpowiedzi z Matematyki": "AchiMAT",
  "Poprawne odpowiedzi z Języka Angielskiego": "AchiENG",
  "Poprawne odpowiedzi z Przyrody": "AchiSCI"
};

interface AchivmentsProps {
  onClose: () => void;
}

const Osiagniecia: React.FC<AchivmentsProps> = ({ onClose }) => {
  const [achievements, setAchievements] = useState<AchievementsData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/get-achievements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania osiągnięć');
      }

      const data = await response.json();
      setAchievements(data.achievements);
    } catch (error) {
      console.error('Błąd pobierania osiągnięć:', error);
      setError('Nie udało się pobrać osiągnięć.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (isLoading) {
    return <p>Ładowanie...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  const achievementEntries = Object.entries(achievements);

  return (
    <div className="popupAchievements">
      <div className="vertical-line"></div>
      <button className="return-button" onClick={onClose}>X</button>
      <div className="popup-content">
        <h2 className="achievements-title">OSIĄGNIĘCIA</h2>
        {achievementEntries.length === 0 ? (
          <p>Brak dostępnych osiągnięć.</p>
        ) : (
          <div className="achievements-list">
            {achievementEntries.map(([task, achievementData], index) => {
              const iconBase = achievementIcons[task] || "AchiENG";
              const currentIcon = `/achivments_icon/${iconBase}_${achievementData.currentLevel}.png`;
              const nextIcon = `/achivments_icon/${iconBase}_${achievementData.currentLevel + 1}.png`;

              return (
                <div key={index} className="achievement-item">
                  {}
                  <img className="achievement-icon" src={currentIcon} alt={`Poziom ${achievementData.currentLevel}`} />

                  {}
                  <div className="achievement-info">
                    <h3 className="achievement-title">{task}</h3> {}
                    {achievementData.nextLevelRequirement !== null ? (
                      <div className="achievement-progress-container">
                        <div className="achievement-progress-bar">
                          <div
                            className="achievement-progress-fill"
                            style={{
                              width: `${(achievementData.userProgress / achievementData.nextLevelRequirement) * 100}%`
                            }}
                          ></div>
                        </div>
                        <div className="achievement-progress-text">
                          {achievementData.userProgress} / {achievementData.nextLevelRequirement}
                        </div>
                      </div>
                    ) : (
                      <p>Maksymalny poziom osiągnięty!</p>
                    )}
                  </div>

                  {}
                  <img className="achievement-icon" src={nextIcon} alt={`Poziom ${achievementData.currentLevel + 1}`} />
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default Osiagniecia;
