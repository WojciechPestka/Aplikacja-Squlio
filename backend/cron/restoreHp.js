const cron = require('node-cron');
const User = require('../models/User');
const moment = require('moment-timezone');

async function restoreHp() {
  try {
    console.log('Sprawdzanie użytkowników do odnowienia HP.');

    const now = moment().tz("Europe/Warsaw").toDate();
    const oneHourAgo = moment(now).subtract(1, 'hours').toDate();

    console.log(`Aktualny czas: ${now}`);
    console.log(`Jedna godzina temu: ${oneHourAgo}`);
    const users = await User.find({
      lastHpLoss: { $lte: oneHourAgo }
    });

    console.log(`Użytkownicy do odnowienia HP: ${users.length}`);

    let updatedCount = 0;

    for (let user of users) {
      console.log(`Użytkownik: ${user.name} ${user.email} data utraty HP: ${user.lastHpLoss}`);
      console.log(`  Obecne HP: ${user.hp}`);
      console.log(`  Limit HP: ${user.hpLimit}`);
      console.log(`  Ostatnia utrata HP: ${user.lastHpLoss}`);

      if (user.hp < user.hpLimit) {
        user.hp = Math.min(user.hpLimit, user.hp + 1);
        user.lastHpLoss = moment().tz("Europe/Warsaw").add(1, 'hours').toDate();

        console.log(`  Nowe HP: ${user.hp}`);
        console.log(`  Nowy czas lastHpLoss: ${user.lastHpLoss}`);

        await user.save();
        console.log(`  Zapisano zmiany dla użytkownika: ${user.name} ${user.email}`);
        updatedCount++;
      } else {
        console.log(`  HP użytkownika ${user.name} ${user.email} jest już na maksymalnym poziomie.`);
      }
    }

    console.log(`Odnowiono HP dla ${updatedCount} użytkowników.`);
  } catch (error) {
    console.error('Błąd podczas odnawiania HP:', error);
  }
}

cron.schedule('* * * * *', restoreHp);

module.exports = { restoreHp };
