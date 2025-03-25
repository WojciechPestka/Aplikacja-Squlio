import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wardrobe.css';

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

interface OwnedItem {
  id: number;
  name: string;
  type: 'hat' | 'arm' | 'leg';
  url: string;
}

interface SelectItemBody {
  itemId: number | null;
  isEquipped: boolean;
}

const Wardrobe: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<{
    head: EquippedItem | null;
    arm: EquippedItem | null;
    leg: EquippedItem | null;
  }>({
    head: null,
    arm: null,
    leg: null,
  });

  const [currentCategory, setCurrentCategory] = useState<'hat' | 'arm' | 'leg'>('hat');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacterData();
    fetchOwnedItems();
  }, []);

  const fetchCharacterData = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://squlio.edu.pl/api/character', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCharacter(data);
      setEquippedItems(data.equippedItems);
    } catch (error) {
      console.error('Error fetching character data:', error);
    }
  };

  const fetchOwnedItems = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://squlio.edu.pl/api/wardrobe/items', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        return;
      }

      setOwnedItems(data);
    } catch (error) {
      console.error('Error fetching owned items:', error);
    }
  };


  const mapSlot = (type: 'hat' | 'arm' | 'leg'): keyof typeof equippedItems => {
    if (type === 'arm') return 'arm';
    if (type === 'leg') return 'leg';
    return 'head';
  };

  const handleItemClick = async (item: OwnedItem) => {
    const slot = mapSlot(item.type);
    const currentItem = equippedItems[slot];
    const updatedEquipped = { ...equippedItems };

    const isRemoving = currentItem && currentItem.id === item.id;
    const isEquipped = !isRemoving;
    const bodyToSend: SelectItemBody = {
      itemId: item.id,
      isEquipped: isEquipped,
    };

    if (isRemoving) {
      updatedEquipped[slot] = null;
    } else {
      updatedEquipped[slot] = {
        id: item.id,
        name: item.name,
        url: item.url,
      };
    }

    setEquippedItems(updatedEquipped);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://squlio.edu.pl/api/select-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      const result = await response.json();
      console.log('select-item result:', result);
    } catch (error) {
      console.error('Error equipping/removing item:', error);
    }
  };

  const filteredItems = ownedItems.filter((o) => o.type === currentCategory);

  return (
    <div className="wardrobe-main-menu">
      <div className="background" />
      <div className="wardrobe-panel">

        {}
        <button className="wardrobe-return-button" onClick={() => navigate('/')}>
          {'<'}
        </button>

        {}
        <div className="wardrobe-left">
          <div className="currency-bar">
            <div className="currency-item">
              <img src="/icons/extracoin.png" alt="extracoins" />
              <span>{character?.extracoins ?? 0}</span>
            </div>
            <div className="currency-item">
              <img src="/icons/coin.png" alt="coins" />
              <span>{character?.coins ?? 0}</span>
            </div>
          </div>

          <div className="category-icons">
            <div className="category-icon" onClick={() => setCurrentCategory('hat')}>
              <img src="/icons_wardrobe/icon_item_head.png" alt="hat-icon" />
            </div>
            <div className="category-icon" onClick={() => setCurrentCategory('arm')}>
              <img src="/icons_wardrobe/icon_item_body.png" alt="arm-icon" />
            </div>
            <div className="category-icon" onClick={() => setCurrentCategory('leg')}>
              <img src="/icons_wardrobe/icon_item_shoes.png" alt="leg-icon" />
            </div>
          </div>

          <div className="character-container-w">
            <img
              src={character?.legs}
              alt="Legs"
              className="wardrobe-character-part legs"
            />
            <img
              src={character?.body}
              alt="Body"
              className="wardrobe-character-part body"
            />
            <img
              src={character?.head}
              alt="Head"
              className="wardrobe-character-part head"
            />

            {equippedItems.leg && (
              <img
                src={equippedItems.leg.url}
                alt="Equipped Legs"
                className="wardrobe-character-skin legs"
              />
            )}
            {equippedItems.arm && (
              <img
                src={equippedItems.arm.url}
                alt="Equipped Arm"
                className="wardrobe-character-skin arm"
              />
            )}
            {equippedItems.head && (
              <img
                src={equippedItems.head.url}
                alt="Equipped Head"
                className="wardrobe-character-skin head"
              />
            )}
          </div>
        </div>

        {}
        <div className="wardrobe-right">
          <div className="items-panel">
            <div className="items-grid">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const slot = mapSlot(item.type);
                  const isEquipped = equippedItems[slot]?.id === item.id;
                  const iconUrl = item.url.replace('.png', '_icon.png');

                  return (
                    <div
                      key={item.id}
                      className={`wardrobe-owned-item ${isEquipped ? 'selected' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <img src={iconUrl} alt={item.name} className="wardrobe-item-image" />
                    </div>
                  );
                })
              ) : (
                <p className="no-items-message">Nie posiadasz jeszcze żadnych przedmiotów.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Wardrobe; 