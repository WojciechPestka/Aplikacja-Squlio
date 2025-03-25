const DailyStatistics = require("../models/DailyStatistics");

const getDailyStats = async (req, res) => {
    try {
        console.log("Otrzymano zapytanie o statystyki dla:", req.params.date);

        const { date } = req.params;
        if (!date || isNaN(Date.parse(date))) {
            return res.status(400).json({ message: "Niepoprawna data. Użyj formatu YYYY-MM-DD." });
        }

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        console.log(`Szukam statystyk między: ${startOfDay.toISOString()} a ${endOfDay.toISOString()}`);

        const stats = await DailyStatistics.findOne({
            date: { $gte: startOfDay, $lt: endOfDay }
        });

        if (!stats) {
            console.log("Brak statystyk dla:", date);
            return res.status(404).json({ message: "Brak statystyk dla podanej daty." });
        }

        console.log("Zwracam statystyki:", stats);
        res.status(200).json(stats);
    } catch (error) {
        console.error("Błąd pobierania dziennych statystyk:", error);
        res.status(500).json({ message: "Wystąpił błąd podczas pobierania statystyk." });
    }
};



const compareDailyStats = async (req, res) => {
    try {
        console.log("porównywanie dat")
        const { date1, date2 } = req.params;

        if (!date1 || !date2 || isNaN(Date.parse(date1)) || isNaN(Date.parse(date2))) {
            return res.status(400).json({ message: "Niepoprawne daty. Użyj formatu YYYY-MM-DD." });
        }
        console.log("data 1 " + date1 + " data 2 " + date2)
        console.log("porównywanie dat")
        const queryisoDate1 = new Date(date1);
        const queryisoDate2 = new Date(date2);
        const startOfDay = new Date(date1);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date1);
        endOfDay.setUTCHours(23, 59, 59, 999);
        queryisoDate2.setHours(0, 0, 0, 0);
        const queryDate1 = queryisoDate1.toISOString();
        const queryDate2 = queryisoDate2.toISOString();
        console.log("queryDate1 " + queryDate1 + " queryDate2 " + queryDate2);
        const stats1 = await DailyStatistics.findOne({
            date: { $gte: startOfDay, $lt: endOfDay }
        });
        console.log("stats 1" + stats1)
        const stats2 = await DailyStatistics.findOne({ date: queryDate2 });
        console.log("stats 2 " + stats2)
        console.log("porównywanie dat")
        console.log("porównywanie dat")
        const comparison = {
            totalUsers: { [date1]: stats1.totalUsers, [date2]: stats2.totalUsers },
            completedUsers: { [date1]: stats1.completedUsers, [date2]: stats2.completedUsers },
            completionRate: { [date1]: stats1.completionRate, [date2]: stats2.completionRate },
            avgLevel: { [date1]: stats1.avgLevel, [date2]: stats2.avgLevel },
            avgCoins: { [date1]: stats1.avgCoins, [date2]: stats2.avgCoins }
        };

        res.status(200).json(comparison);
        console.log(comparison)
    } catch (error) {
        console.error("Błąd porównywania statystyk:", error);
        res.status(500).json({ message: "Wystąpił błąd podczas porównywania statystyk." });
    }
};


module.exports = { getDailyStats, compareDailyStats };
