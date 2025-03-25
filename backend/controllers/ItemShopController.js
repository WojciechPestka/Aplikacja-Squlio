const ItemShop = require('../models/ItemShop');
const User = require('../models/User');
const { taskProgress } = require('../middlewares/tasks')

const getShopItems = async (req, res) => {
    try {
        console.log("Pobieranie przedmiotów ze sklepu...");

        const userId = req.user.userId; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        const userItems = user.items || [];

        const items = await ItemShop.find();

        if (!items.length) {
            return res.status(404).json({ message: 'Brak przedmiotów w sklepie.' });

        }

        const availableItems = items.filter(item => !userItems.includes(item.id));
        taskProgress(user._id, 'available_items', { availableItems: availableItems });

        res.status(200).json(availableItems);
    } catch (error) {
        console.error('Błąd podczas pobierania przedmiotów ze sklepu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania przedmiotów ze sklepu.' });
    }
};

const BuyItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.userId; 

        const item = await ItemShop.findOne({ id: itemId });
        if (!item) {
            return res.status(404).json({ message: 'Przedmiot nie został znaleziony.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        if (user.level < item.requiredLevel) {
            return res.status(200).json({ message: 'Zbyt niski poziom, aby wybrać ten przedmiot.' });
        }

        if (user.coins < item.cost) {
            return res.status(200).json({ message: 'Za mało monet, aby wybrać ten przedmiot.' });
        }

        user.coins -= item.cost;
        user.items.push(item.id);
        await user.save();

        res.status(200).json({
            message: `Pomyślnie wybrano przedmiot: ${item.name}`,
            remainingCoins: user.coins,
            success: true,
        });
        taskProgress(user._id, 'skin_purchased', { skinPurchased: item.name });
    } catch (error) {
        console.error('Błąd podczas wyboru przedmiotu ze sklepu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas wyboru przedmiotu ze sklepu.' });
    }
};

const BuyEditCharacter = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        console.log("Próba zakupu edycji postaci");
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        if (user.extracoins < 10) {
            return res.status(400).json({ message: 'Masz za mało diamencików' });
        }

        user.extracoins -= 10;
        user.editableCharacter = true;
        await user.save();

        return res.status(200).json({
            message: 'Pomyślnie zakupiono edycję postaci',
            view: 'createcharacter',
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji postaci:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji postaci.' });
    }
}

module.exports = { getShopItems, BuyItem, BuyEditCharacter };
