const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('editableCharacter');

    if (user && user.editableCharacter === true) {
      console.log("Możesz edytować postać.");
      return next();
    } else {
      console.log("Nie możesz edytować postaci.", user);
      return res.status(403).json({ message: "Nie możesz edytować postaci." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
};
