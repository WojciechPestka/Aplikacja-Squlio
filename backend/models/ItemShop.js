const mongoose = require('mongoose');

const ItemShopSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, unique: false },
    url: { type: String, required: true, unique: true },
    requiredLevel: { type: Number, required: true, unique: false },
    cost: { type: Number, required: true, unique: false },
});

const ItemShop = mongoose.model('ItemShop', ItemShopSchema);

module.exports = ItemShop;