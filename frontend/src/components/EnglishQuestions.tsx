import React, { useEffect, useState } from 'react';
import './EnglishQuestions.css';
import { useNavigate } from 'react-router-dom';

interface QuestionData {
  id_question: number;
  question: string;
  correct_answer: string;
  incorrect_answer_1: string;
  incorrect_answer_2: string;
  incorrect_answer_3: string;
}

interface UserStats {
  currentLevel: number;
  currentExp: number;
  requiredExpForNextLevel: number;
  currentCoins: number;
  currentElo: number;
  currentHp: number;
  extracoins: number;
  addcoins: number;
  name: string;
  hpLimit: number;
  timeLeft: number;
  taskLevel: number;
}

interface EnglishQuestionProps {
  level: number;
}

const EnglishQuestion: React.FC<EnglishQuestionProps> = ({ level }) => {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackClass, setFeedbackClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetchQuestion();
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime && prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);
  
    return () => clearInterval(interval);
  }, [level]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setFeedbackClass('');
    setSelectedAnswer(null);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('Brak autoryzacji. Zaloguj się ponownie.');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://squlio.edu.pl/api/english-questions/${level}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setQuestionData(data.question);
        setUserStats(data.userStats);

        const shuffledAnswers = [
          data.question.correct_answer,
          data.question.incorrect_answer_1,
          data.question.incorrect_answer_2,
          data.question.incorrect_answer_3,
        ].sort(() => Math.random() - 0.5);

        setAnswers(shuffledAnswers);
      } else {
        setError(data.message || 'Błąd pobierania pytania.');
      }
      console.log("Otrzymany timeLeft z serwera:", data.userStats?.timeLeft);
      if (data.userStats?.currentHp < 100) {
        setTimeRemaining(data.userStats?.timeLeft);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania pytania:', err);
      setError('Wystąpił błąd podczas pobierania pytania.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string, event: React.MouseEvent) => {
    setSelectedAnswer(answer);

    if (answer === questionData?.correct_answer) {
      setFeedback('Poprawna odpowiedź');
      setFeedbackClass('correct');

      triggerBallAnimation(event);

      triggerCoinAnimation(event, userStats?.addcoins || 0);


      const levelBarProgress = document.querySelector('.level-bar-progress') as HTMLElement;
      if (levelBarProgress) {
        const originalColor = levelBarProgress.style.backgroundColor || '#3F3D8F';
        levelBarProgress.style.backgroundColor = 'white';
        setTimeout(() => {
          levelBarProgress.style.backgroundColor = originalColor;
        }, 1000);
      }
    } else {
      const updatedHp = Math.max(0, (userStats?.currentHp || 1) - 1);
      setUserStats((prev) => ({
        ...prev!,
        currentHp: updatedHp,
      }));
      setFeedback(`Zła odpowiedź. Twoje życie zmniejszyło się do ${updatedHp}.`);
      setFeedbackClass('error');
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('Brak autoryzacji. Zaloguj się ponownie.');
        return;
      }

      console.log('Submitting answer:', answer);
      const response = await fetch('https://squlio.edu.pl/api/submit-english-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questionData?.id_question,
          answer,
        }),
      });

      const result = await response.json();
      console.log('Answer Response:', result);

      if (response.ok) {
        setUserStats((prev) => ({
          ...prev!,
          currentLevel: result.newLevel,
          currentExp: result.newExp,
          currentCoins: result.newCoins,
          currentElo: result.newElo,
          currentHp: result.hp,
          extracoins: result.extracoins,
          addcoins: result.addcoins,
          name: result.name,
        }));
      } else {
        setError(result.message || 'Błąd przy przesyłaniu odpowiedzi.');
      }
    } catch (err) {
      console.error('Błąd przy przesyłaniu odpowiedzi:', err);
      setError('Wystąpił błąd podczas przesyłania odpowiedzi.');
    }
  };
  const triggerBallAnimation = (event: React.MouseEvent) => {
    const ballsContainer = document.createElement('div');
    ballsContainer.className = 'balls-container';
    console.log("animacja z expeem ")
    const { clientX, clientY } = event;
    const levelBar = document.querySelector('.level-bar') as HTMLElement;
    if (!levelBar) return;

    const barRect = levelBar.getBoundingClientRect();
    const targetX = barRect.left + barRect.width / 2;
    const targetY = barRect.top + barRect.height / 2;

    console.log("gdzie lecą bombelki " + targetX + targetY);

    for (let i = 0; i < 5; i++) {
      const ball = document.createElement('div');
      ball.className = 'ball';

      const offsetX = i < 3 ? 0 : (Math.random() > 0.5 ? 20 : -20);
      const offsetY = i < 3 ? 0 : (Math.random() > 0.5 ? 20 : -20);

      ball.style.left = `${clientX}px`;
      ball.style.top = `${clientY}px`;

      ballsContainer.appendChild(ball);

      ball.animate(
        [
          { transform: `translate(0, 0)`, opacity: 1 },
          { transform: `translate(${targetX - clientX + offsetX}px, ${targetY - clientY + offsetY}px)` },
        ],
        {
          duration: 1000 + i * 100, 
          easing: 'ease-in-out',
        }
      );

      ball.addEventListener('animationend', () => {
        ball.remove();
        if (ballsContainer.children.length === 0) {
          ballsContainer.remove();
        }
      });
    }

    document.body.appendChild(ballsContainer);
  };
  const triggerCoinAnimation = (event: React.MouseEvent, coinCount: number) => {

    console.log('Uruchamianie animacji monet');
    console.log(`Liczba monet do animacji: ${coinCount}`);




    const coinsContainer = document.createElement('div');
    coinsContainer.className = 'coins-container';
    document.body.appendChild(coinsContainer);
    console.log('Dodano kontener monet:', coinsContainer);

    console.log("animacja z coinami");
    const { clientX, clientY } = event;
    const coinIcon = document.querySelector('.character-coins-box') as HTMLElement;
    if (!coinIcon) {
      console.error('Nie znaleziono elementu .character-coins-box');
      return;
    }



    console.log('Pozycja kliknięcia:', { x: clientX, y: clientY });
    console.log('Target (character-coins-box):', coinIcon);



    const iconRect = coinIcon.getBoundingClientRect();
    const targetX = iconRect.left + iconRect.width / 2;
    const targetY = iconRect.top + iconRect.height / 2;

    console.log("gdzie lecą coiny " + targetX + targetY);

    const coinsToAnimate = Math.min(coinCount, 15); 
    for (let i = 0; i < coinsToAnimate; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin';

      const offsetX = Math.random() * 20 - 10; 
      const offsetY = Math.random() * 20 - 10; 

      coin.style.left = `${clientX}px`;
      coin.style.top = `${clientY}px`;

      coinsContainer.appendChild(coin);

      coin.animate(
        [
          { transform: `translate(0, 0)`, opacity: 1 },
          { transform: `translate(${targetX - clientX + offsetX}px, ${targetY - clientY + offsetY}px)` },
        ],
        {
          duration: 1000 + i * 50, 
          easing: 'ease-in-out',
        }
      );

      coin.addEventListener('animationend', () => {
        coin.remove();
        if (coinsContainer.children.length === 0) {
          coinsContainer.remove();
        }
      });
    }

    document.body.appendChild(coinsContainer);
  };

  const handleNextQuestion = () => {
    fetchQuestion();
  };

  const handleReturnToMainPage = () => {
    navigate('/');
  };

  const formatTime = (milliseconds: number | null) => {
    if (milliseconds === null || milliseconds <= 0) return "00:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
  
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };


  return (
    <div className={`math-question-container level-${userStats?.taskLevel}`}>
      <h1>Język Angielski</h1>
      <button onClick={handleReturnToMainPage} className="back-button">
        {'<'}
      </button>
      {userStats && (
        <div className="user-stats">
          <div className="character-info">
            <div className="character-name">{userStats.name}</div>
            <div className="level-section">
              <div className="level-bar">
                <div
                  className="level-bar-progress"
                  style={{
                    width: `${((userStats.currentExp) / (userStats.requiredExpForNextLevel || 1)) * 100}%`, 
                  }}
                ></div>
                <div className="level-bar-text">
                  {userStats.currentExp} / {userStats.requiredExpForNextLevel || '...'}
                </div>
              </div>
              <div className="character-level">LvL. {userStats.currentLevel}</div>
            </div>
          </div>
          <div className="question-character-coins-box">
            <img className='coin-icon' src="/icons/coin.png" alt="coin-icon" />
            <div className="character-coins">{userStats.currentCoins}</div>
          </div>

          <div className="question-character-extracoins-box">
            <img className='extracoin-icon' src="/icons/extracoin.png" alt="extracoin-icon" />
            <div className="character-extracoins">{userStats.extracoins}</div>
          </div>

          <div className="character-hp-box">
            <div className="question-character-hp"> <img className='life-icon' src="/icons/life.png" alt="life-icon" /> {userStats.currentHp}/{userStats.hpLimit}</div>
            <div className="question-character-hp-timer">
              {userStats && userStats.hpLimit < 100 && (
                <p>{formatTime(timeRemaining)}</p>
              )}
            </div>
          </div>

          <div className='addcoins-box'>{userStats.addcoins}</div>

        </div>
      )}
      {loading ? (
        <p>Ładowanie pytania...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : questionData ? (
        <div className="question-box">
          <p>{questionData.question}</p>
          <div className="answers">
            {answers.map((answer) => (
              <button key={answer} onClick={(event) => submitAnswer(answer, event)}
                className={`answer-button ${selectedAnswer ? (answer === questionData.correct_answer ? 'selected-correct' : answer === selectedAnswer ? 'selected-wrong' : '') : ''}`}
                disabled={!!selectedAnswer}>
                {answer}
              </button>
            ))}
          </div>
          {feedback && <p className={`feedback ${feedbackClass}`}>{feedback}</p>}
          {selectedAnswer && <button onClick={handleNextQuestion} className="next-question-button">Kolejne pytanie</button>}
        </div>
      ) : (
        <p>Brak pytań dla tego poziomu.</p>
      )}
    </div>
  );
};

export default EnglishQuestion;
