
const User = require("../models/User");


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserById
};
