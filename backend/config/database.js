const mongoose = require('mongoose');
const config = require('./connection');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
    });
    console.log('Polaczono z baza danych MongoDB (po zmianie serwera)');
  } catch (error) {
    console.error('Blad polaczenia z baza danych MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
