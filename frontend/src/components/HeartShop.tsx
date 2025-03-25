import React, { useEffect, useState } from 'react';
import './HeartShop.css';

interface UserData {
  extracoins: number;
  hp: number;
  hpLimit: number;
}

interface HeartShopProps {
  onClose: () => void;
}

const HeartShop: React.FC<HeartShopProps> = ({ onClose }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const heartCost = 5;

  useEffect(() => {
    if (!popupMessage) return;

    console.log("Popup się pojawił:", popupMessage);

    const timer = setTimeout(() => {
      console.log("Ukrywam popup");
      setPopupMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [popupMessage]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const showPopup = (message: string) => {
    console.log("Ustawiam popupMessage:", message);
    setPopupMessage(message);
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('/api/get-heart-shop', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Błąd podczas ładowania danych użytkownika');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Błąd wczytywania danych użytkownika:', error);
    }
  };

  const handleBuyHeart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('/api/buy-heart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: "buy_heart" })
      });

      if (!response.ok) throw new Error('Błąd podczas zakupu serduszka?');
      const data = await response.json();
      console.log("Odpowiedź serwera:", data);
      setUser((prevUser) => prevUser ? {
        ...prevUser,
        extracoins: data.remainingExtraCoins,
        hp: data.newHp,
        hpLimit: data.newHpLimit,
      } : null);
      if (data.success) {
        showPopup(`Zakupiono serduszko! Nowe HP: ${data.newHp}`);
      } else {
        showPopup(`${data.message}`);
      }
    } catch (error) {
      console.error('Błąd zakupu serduszka:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div className="heart-shop-popup">
      <div className="heart-shop-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Za mało żyć? Dokup dodatkowe serduszka!</h2>
        <p>
          <img className='life-iconHS' src="/icons/life.png" alt="life-icon" /> = {heartCost}x
          <img className='extracoin-iconHS' src="/icons/extracoin.png" alt="extracoin-icon" />
        </p>
        <div className="heart-options">
          <button
            className="heart-buy"
            onClick={handleBuyHeart}
            disabled={isLoading || user.extracoins < heartCost}
          >
            KUP
          </button>
        </div>
        {}
        {popupMessage && (
          <div className="popup">
            <p>{popupMessage}</p>
          </div>
        )}
        <div className="user-info">
        </div>
      </div>
    </div>
  );
};

export default HeartShop;