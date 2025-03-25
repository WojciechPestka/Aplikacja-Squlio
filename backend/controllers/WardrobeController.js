const ItemShop = require('../models/ItemShop');
const User = require('../models/User');
const { taskProgress } = require('../middlewares/tasks')

const getWardrobeItems = async (req, res) => {
    try {
        console.log("Pobieranie przedmiotów z garderoby...");
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        const userItems = user.items || [];
        console.log("przedmioty urzytkownika: " + user.items)
        if (!userItems.length) {
            return res.status(404).json({ message: 'Użytkownik nie posiada żadnych przedmiotów.' });
        }

        const wardrobeItems = await ItemShop.find({ id: { $in: userItems } });
        console.log("przedmioty w garderobie: " + wardrobeItems)
        if (!wardrobeItems.length) {
            return res.status(404).json({ message: 'Nie znaleziono żadnych przedmiotów użytkownika w bazie.' });
        }

        res.status(200).json(wardrobeItems);
    } catch (error) {
        console.error('Błąd podczas pobierania przedmiotów z garderoby:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania przedmiotów z garderoby.' });
    }
};

const selectItem = async (req, res) => {
    try {
        const { itemId, isEquipped } = req.body;
        const userId = req.user.userId;
        console.log("id itemu z itemID: " + itemId)
        console.log("Czy ubrany: " + isEquipped);
        const item = await ItemShop.findOne({ id: itemId });
        console.log("id itemu z item: " + item.id)
        console.log("typ itemu " + item.type)
        if (!item) {
            return res.status(404).json({ message: 'Przedmiot nie został znaleziony.' });
        }

        const user = await User.findById(userId);
        console.log("Gracz " + user.name)
        console.log("Gracz " + user.email)
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        const updateSkin = (type, value) => {
            if (type === "hat") user.headSkin = value;
            else if (type === "arm") user.armSkin = value;
            else if (type === "leg") user.legSkin = value;
        };

        if (isEquipped) {
            updateSkin(item.type, item.id);
            console.log(`Skin został ubrany: ${item.name}`);
            taskProgress(user._id, 'skin_clothes', { skinClothes: item.name });
        } else {
            updateSkin(item.type, null);
            console.log(`Skin został zdjęty z typu: ${item.type}`);
        }
        await user.save();

        taskProgress(user._id, 'dressed_skins', {
            headSkin: user.headSkin,
            armSkin: user.armSkin,
            legSkin: user.legSkin
        });

        res.status(200).json({
            message: `Pomyślnie wybrano przedmiot: ${item.type}`,
        });
    } catch (error) {
        console.error('Błąd podczas wyboru przedmiotu ze sklepu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas wyboru przedmiotu ze sklepu.' });
    }
};


module.exports = { getWardrobeItems, selectItem };
