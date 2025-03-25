import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ItemShop.css';

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
  extracoins: number;
  equippedItems: {
    head: EquippedItem | null;
    arm: EquippedItem | null;
    leg: EquippedItem | null;
  };
}

interface ShopItem {
  id: number;
  name: string;
  type: string;
  url: string;
  requiredLevel: number;
  cost: number;
}

const ItemShop: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const showPopup = (message: string) => {
    console.log("Ustawiam popupMessage:", message);
    setPopupMessage(message);
  };

  useEffect(() => {
    if (!popupMessage) return;
  
    console.log("Popup się pojawił:", popupMessage);
  
    const timer = setTimeout(() => {
      console.log("Ukrywam popup");
      setPopupMessage(null);
    }, 3000);
  
    return () => clearTimeout(timer);
  }, [popupMessage]);

  const fetchCharacterData = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/character', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Błąd podczas ładowania danych postaci');
      const data = await response.json();

      setCharacter({
        name: data.name,
        head: data.head,
        body: data.body,
        legs: data.legs,
        level: data.level,
        coins: data.coins,
        extracoins: data.extracoins,
        equippedItems: {
          head: data.equippedItems.head,
          arm: data.equippedItems.arm,
          leg: data.equippedItems.leg,
        },
      });
    } catch (error) {
      console.error('Błąd wczytywania danych postaci:', error);
      showPopup('Błąd wczytywania danych postaci');
    }
  };

  const fetchShopItems = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/shop/items', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Błąd podczas ładowania przedmiotów sklepu');
      const data = await response.json();
      setShopItems(data);
    } catch (error) {
      console.error('Błąd wczytywania przedmiotów sklepu:', error);
      showPopup('Błąd wczytywania przedmiotów sklepu');
    }
  };

  const handleItemBuy = async (item: ShopItem) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/shop/buy-item', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Błąd podczas zakupu przedmiotu');
      await fetchCharacterData();
      await fetchShopItems();
      if (data.success) {
        showPopup(`${data.message}`);
      } else {
        showPopup(`${data.message}`);
      }
    } catch (error) {
      console.error('Błąd zakupu przedmiotu:', error);
      showPopup('Nie udało się zakupić przedmiotu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCharacter = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Brak tokenu autoryzacyjnego');

      const response = await fetch('https://squlio.edu.pl/api/buy-edit-character', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message);
        return;
      }

      navigate("/characterbuild");
    } catch (error) {
      console.error('Błąd zakupu edycji postaci:', error);
      showPopup('Nie udało się zakupić edycji postaci');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
    fetchShopItems();
  }, [location]);

  if (!character || isLoading) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div className="itemshop-main-menu">
      <div className="background" />
      <div className="itemshop-shop-panel">

        {}
        <button className="itemshop-return-button" onClick={() => navigate(-1)}>
          {'<'}
        </button>

        {}
        <div className="itemshop-currency-bar">
          <div className="itemshop-currency-item">
            <img src="/icons/extracoin.png" alt="extracoins" />
            <span>{character.extracoins ?? 0}</span>
          </div>
          <div className="itemshop-currency-item">
            <img src="/icons/coin.png" alt="coins" />
            <span>{character.coins ?? 0}</span>
          </div>
        </div>

        {}
        <div className="itemshop-character-display">
          <div className="itemshop-character-images">
            <img src={character.legs} alt="legs" className="itemshop-character-part legs" />
            <img src={character.body} alt="body" className="itemshop-character-part body" />
            <img src={character.head} alt="head" className="itemshop-character-part head" />

            {character.equippedItems.head && (
              <img src={character.equippedItems.head.url} alt="head-skin" className="itemshop-character-skin head" />
            )}
            {character.equippedItems.arm && (
              <img src={character.equippedItems.arm.url} alt="arm-skin" className="itemshop-character-skin arm" />
            )}
            {character.equippedItems.leg && (
              <img src={character.equippedItems.leg.url} alt="leg-skin" className="itemshop-character-skin legs" />
            )}
          </div>

          {}
          <button className="edit-character-button" onClick={handleEditCharacter}>
            Edytuj postać
            <img src="/icons/extracoin.png" alt="extracoins" className="extracoin-icon-edit" />
            10
          </button>
        </div>

        {}
        <div className="itemshop-shop-items">
          <div className="itemshop-items-panel">
            <div className="itemshop-items-list">
              {shopItems.map((item) => (
                <div key={item.id} className="itemshop-shop-item">
                  <img src={item.url.replace('.png', '_icon.png')} alt={item.name} />
                  <p className="item-name">{item.name}</p>
                  <p className="item-cost">{item.cost} coins</p>
                  <p className="item-required-level">Poziom: {item.requiredLevel}</p>
                  <button
                    onClick={() => handleItemBuy(item)}
                    className="itemshop-select-button"

                  >
                    Kup
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {}
        {popupMessage && (
          <div className="popup-item-shop">
            <p>{popupMessage}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemShop;
