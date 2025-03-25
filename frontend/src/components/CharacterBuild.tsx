import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './CharacterBuild.css';

const CharacterBuild: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [headIndex, setHeadIndex] = useState(0);
  const [bodyIndex, setBodyIndex] = useState(0);
  const [legsIndex, setLegsIndex] = useState(0);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const headImages = ['/head/happy/h1_blue.png', '/head/happy/h1_orange.png', '/head/happy/h2_blue.png', '/head/happy/h2_orange.png', '/head/happy/h3_blue.png', '/head/happy/h3_orange.png'];
  const bodyImages = ['/body/b1_blue.png', '/body/b1_orange.png', '/body/b2_blue.png', '/body/b2_orange.png', '/body/b3_blue.png', '/body/b3_orange.png'];
  const legsImages = ['/legs/l1_blue.png', '/legs/l1_orange.png', '/legs/l2_blue.png', '/legs/l2_orange.png', '/legs/l3_blue.png', '/legs/l3_orange.png'];

  useEffect(() => {
    if (!popupMessage) return;

    console.log("Popup się pojawił:", popupMessage);

    const timer = setTimeout(() => {
      console.log("Ukrywam popup");
      setPopupMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [popupMessage]);

  const showPopup = (message: string) => {
    console.log("Ustawiam popupMessage:", message);
    setPopupMessage(message);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterName(event.target.value);
  };

  const handleHeadChange = (direction: 'prev' | 'next') => {
    setHeadIndex((prevIndex) =>
      direction === 'next'
        ? (prevIndex + 1) % headImages.length
        : (prevIndex - 1 + headImages.length) % headImages.length
    );
  };

  const handleBodyChange = (direction: 'prev' | 'next') => {
    setBodyIndex((prevIndex) =>
      direction === 'next'
        ? (prevIndex + 1) % bodyImages.length
        : (prevIndex - 1 + bodyImages.length) % bodyImages.length
    );
  };

  const handleLegsChange = (direction: 'prev' | 'next') => {
    setLegsIndex((prevIndex) =>
      direction === 'next'
        ? (prevIndex + 1) % legsImages.length
        : (prevIndex - 1 + legsImages.length) % legsImages.length
    );
  };

  const handleSave = async () => {
    const characterData = {
      name: characterName,
      head: headImages[headIndex],
      body: bodyImages[bodyIndex],
      legs: legsImages[legsIndex],
    };

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      showPopup('Nie znaleziono tokenu. Użytkownik musi być zalogowany.');
      return;
    }

    try {
      const response = await fetch('https://squlio.edu.pl/api/saveCharacter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(characterData),
      });

      if (response.ok) {
        showPopup('Postać została zapisana pomyślnie!');
        navigate("/menu"); 
      } else {
        const errorData = await response.json();
        showPopup(`Błąd zapisu postaci: ${errorData.message}`); 
      }
    } catch (error) {
      console.error('Wystąpił błąd podczas zapisywania postaci:', error);
      showPopup('Wystąpił błąd podczas zapisywania postaci.');
    }
  };

  return (
    <div className="character-build">
      <div className="character-name-box">
        <input
          type="text"
          placeholder="Ustaw nazwę"
          value={characterName}
          onChange={handleNameChange}
          className="character-name-input"
        />
      </div>
      <div className="character-container">
        <div className="arrows left-arrows">
          <button onClick={() => handleHeadChange('prev')}>&lt;</button>
          <button onClick={() => handleBodyChange('prev')}>&lt;</button>
          <button onClick={() => handleLegsChange('prev')}>&lt;</button>
        </div>

        <div className="character-preview">
          <img src={headImages[headIndex]} alt="Head" className="character-part head" />
          <img src={bodyImages[bodyIndex]} alt="Body" className="character-part body" />
          <img src={legsImages[legsIndex]} alt="Legs" className="character-part legs" />
        </div>

        <div className="arrows right-arrows">
          <button onClick={() => handleHeadChange('next')}>&gt;</button>
          <button onClick={() => handleBodyChange('next')}>&gt;</button>
          <button onClick={() => handleLegsChange('next')}>&gt;</button>
        </div>
      </div>

      <button onClick={handleSave} className="save-button">
        ZAPISZ POSTAĆ
      </button>

      {/* Popup */}
      {popupMessage && (
        <div className="popup">
          <p>{popupMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterBuild;
