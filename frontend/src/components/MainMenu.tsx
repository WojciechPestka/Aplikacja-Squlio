import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';
import Zadania from './Zadania'; 
import Achivments from './Achivments'; 
import HeartShop from './HeartShop'; 

interface EquippedItem {
  id: number;
  name: string;
  url: string;
}

interface CharacterData {
  name: string;
  head: string;
  body: string;
  legs: string;
  level: string;
  coins: string;
  exp: string;
  extracoins: number;
  hp: number;
  hpLimit: number;
  timeLeft: number;
  happiness: number;
  equippedItems: {
    head: EquippedItem | null;
    arm: EquippedItem | null;
    leg: EquippedItem | null;
  };
}

const MainMenu: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [requiredExpForNextLevel, setRequiredExpForNextLevel] = useState<number | null>(null); 
  const [isAchivmentsVisible, setAchivmentsVisible] = useState(false); 
  const [isPopupVisible, setPopupVisible] = useState(false); 
  const [isPopupVisibleQuestions, setPopupVisibleQuestions] = useState(false); 
  const [isSadPopupVisible, setSadPopupVisible] = useState(false);
  const [isHeartShopVisible, setHeartShopVisible] = useState(false); 
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      console.error('Brak tokenu. Przekierowanie na stronę logowania.');
      navigate('/login');
      return;
    }

    const fetchCharacterData = async () => {
      try {
        const response = await fetch('https://squlio.edu.pl/api/character', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Błąd podczas ładowania danych');
        const data = await response.json();
        setCharacter({
          name: data.name,
          head: data.head,
          body: data.body,
          legs: data.legs,
          level: data.level,
          coins: data.coins,
          exp: data.exp,
          extracoins: data.extracoins,
          hp: data.hp,
          hpLimit: data.hpLimit,
          timeLeft: data.timeLeft,
          happiness: data.happiness,
          equippedItems: {
            head: data.equippedItems.head,
            arm: data.equippedItems.arm,
            leg: data.equippedItems.leg,
          },
        });

        console.log("Otrzymany timeLeft z serwera:", data.timeLeft);

        if (data.happiness === 1 || data.happiness === 2) {
          setSadPopupVisible(true);
          setTimeout(() => setSadPopupVisible(false), 10000);
        }

        if (data.hp < 100) {
          setTimeRemaining(data.timeLeft);
        }
      } catch (error) {
        console.error('Błąd wczytywania danych postaci:', error);
        navigate('/login');
      }
    };

    const fetchRequiredExp = async () => {
      try {
        const response = await fetch('https://squlio.edu.pl/api/userstats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Błąd podczas ładowania wymaganego doświadczenia');
        const data = await response.json();
        setRequiredExpForNextLevel(data.requiredExpForNextLevel);
      } catch (error) {
        console.error('Błąd wczytywania wymaganego doświadczenia:', error);
      }
    };

    fetchCharacterData();
    fetchRequiredExp();

    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime && prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!character) {
    return <p>Ładowanie...</p>;
  }

  const formatTime = (milliseconds: number | null) => {
    if (milliseconds === null || milliseconds <= 0) return "00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <div className="main-menu">
      <div className="MainMenu-header"></div>
      {isSadPopupVisible && (
        <div className="sad-popup">
          Twoja postać jest smutna!! Wykonaj codzienne pytania!!
        </div>
      )}

      <div className="character-info">
        <div className="character-name">{character.name}</div>
        <div className="level-section">
          <div className="level-bar">
            <div
              className="level-bar-progress"
              style={{
                width: `${(parseInt(character.exp) / (requiredExpForNextLevel || 1)) * 100}%`, 
              }}
            ></div>
            <div className="level-bar-text">
              {character.exp} / {requiredExpForNextLevel || '...'}
            </div>
          </div>
          <div className="character-level">LvL. {character.level}</div>
        </div>
      </div>

      <div className="character-coins-box">
        <img className='coin-icon' src="/icons/coin.png" alt="coin-icon" />
        <div className="character-coins">{character.coins}</div>
      </div>

      <div className="character-extracoins-box">
        <img className='extracoin-icon' src="/icons/extracoin.png" alt="extracoin-icon" />
        <div className="character-extracoins">{character.extracoins}</div>
      </div>

      <div className="character-hp-box">
        <div className="character-hp"> <img className='life-icon' src="/icons/life.png" alt="life-icon" /> {character.hp}/{character.hpLimit}</div>
        <button className='heart-shop-button' onClick={() => setHeartShopVisible(true)}>
          +
        </button>
        <div className="character-hp-timer">
          {character && character.hpLimit < 100 && (
            <p>{formatTime(timeRemaining)}</p>
          )}
        </div>
      </div>

      <div className="character-display">
        <div className="character-images">
          <img src={character.legs} alt="legs" className="character-part legs" />
          <img src={character.body} alt="body" className="character-part body" />
          <img src={character.head} alt="head" className="character-part head" />

          {}
          {character.equippedItems.head && (
            <img
              src={character.equippedItems.head.url}
              alt="head-skin"
              className="character-skin head"
            />
          )}
          {character.equippedItems.arm && (
            <img
              src={character.equippedItems.arm.url}
              alt="arm-skin"
              className="character-skin arm"
            />
          )}
          {character.equippedItems.leg && (
            <img
              src={character.equippedItems.leg.url}
              alt="leg-skin"
              className="character-skin legs"
            />
          )}
        </div>
      </div>

      <button
        className={`learn-button ${character.happiness <= 2 ? 'golden-button' : ''}`}
        onClick={() => setPopupVisible(true)}
      >
        UCZ SIĘ!
      </button>

      {isPopupVisible && (
        <div className="popup-questions">
          <button
            className="popup-close"
            onClick={() => setPopupVisible(false)}
          >✖</button>
          <div className="popup-content">
            <button
              onClick={() => {
                setPopupVisible(false);
                navigate('/daily-questions');
              }}
            >
              Codzienne Pytania
            </button>
            <button
              className="math-questions-button"
              onClick={() => {
                setPopupVisible(false);
                navigate('/math-questions');
              }}
            >
              Matematyka
            </button>
            <button
              className="english-questions-button"
              onClick={() => {
                setPopupVisible(false);
                navigate('/english-questions');
              }}
            >
              Język Angielski
            </button>
            <button
              className="programming-questions-button"
              onClick={() => {
                setPopupVisible(false);
                navigate('/programming-questions');
              }}
            >
              Programowanie
            </button>
            <button
              className="science-questions-button"
              onClick={() => {
                setPopupVisible(false);
                navigate('/science-questions');
              }}
            >
              Przyroda
            </button>
          </div>
        </div>
      )}

      <div className="top-right-buttons">
        <button
          onClick={() => navigate('/item-shop')}
          title="Sklep"
        >
          <img className='shop-icon' src="/icons/shop.png" alt="icon-shop" />
        </button>

        <button
          onClick={() => navigate('/wardrobe')}
          title="Garderoba"
        >
          <img className='wardrobe-icon' src="/icons/wardrobe.png" alt="wardrobe-icon" />
        </button>

        <button
          title="Zadania"
          onClick={() => setPopupVisibleQuestions(true)}
        >
          <img className="quest-icon" src="/icons/quest2.png" alt="quest-icon" />
        </button>

        <button
          title="Osiągnięcia"
          onClick={() => setAchivmentsVisible(true)}
        >
          <img className="achivment-icon" src="/icons/achivment.png" alt="achivment-icon" />
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            navigate('/login');
          }}
          title="Wyloguj"
        >
          <img className='logout-icon' src="/icons/logout.png" alt="logout-icon" />
        </button>
      </div>
      {isPopupVisibleQuestions && <Zadania onClose={() => setPopupVisibleQuestions(false)} />}
      {isAchivmentsVisible && <Achivments onClose={() => setAchivmentsVisible(false)} />}
      {isHeartShopVisible && <HeartShop onClose={() => setHeartShopVisible(false)} />}
    </div>
  );
};

export default MainMenu;