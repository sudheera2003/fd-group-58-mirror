const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");
const Project = require("../models/Project");
const Team = require("../models/Team");
const Task = require("../models/Task");

// get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role", "name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// update User Role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;

    // find User first to check Team status
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check: is user on a team?
    if (user.teamId) {
      const team = await Team.findById(user.teamId);
      const teamName = team ? team.name : "Unknown Team";

      return res.status(400).json({
        message: `User is currently a member of the team "${teamName}". Please remove them from the team first.`,
      });
    }

    // find role
    const newRole = await Role.findOne({ name: roleName });
    if (!newRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: newRole._id },
      { new: true }
    ).populate("role", "name");

    req.io.emit("user_update", { action: "role_change", userId: id });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate("role", "name");

    if (!user) return res.status(404).json({ message: "User not found" });

    // check: is user on a team?
    if (user.teamId) {
      const team = await Team.findById(user.teamId);
      const teamName = team ? team.name : "a team";

      // removed emit from here
      return res.status(400).json({
        message: `User is currently assigned to the team "${teamName}". Please remove them from the team first.`,
      });
    }

    const userRole = user.role?.name?.toLowerCase();

    // check: organizer validation
    if (userRole === "organizer") {
      const projectCount = await Project.countDocuments({
        "team.organizerEmail": { $regex: new RegExp(`^${user.email}$`, "i") },
      });

      if (projectCount > 0) {
        return res.status(400).json({
          message: `Cannot delete: This Organizer owns ${projectCount} active project(s). Please delete them first.`,
        });
      }

      const team = await Team.findOne({ organizer: id });
      if (team) {
        return res.status(400).json({
          message: `Cannot delete: This Organizer still manages the team "${team.name}". Please delete the team first.`,
        });
      }
    }

    // final delete
    await User.findByIdAndDelete(id);

    // success message
    req.io.emit("user_update", { action: "delete", userId: id });

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// update user profile (self)
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // only allow updating name and email
    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    ).populate("role", "name");

    req.io.emit("user_update", { action: "profile_update", userId: id });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchUsers = async (req, res) => {
  // shortened path
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const targetRoles = await Role.find({
      name: { $in: ["member", "organizer"] },
    });

    const roleIds = targetRoles.map((role) => role._id);

    // search Users
    const users = await User.find({
      email: { $regex: query, $options: "i" },
      role: { $in: roleIds },
    })
      .select("_id username email role")
      .populate("role", "name")
      .limit(5);

    // format
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role ? user.role.name : "unknown",
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // security check: does this role ID actually exist in the database
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use." });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role,
    });

    await newUser.save();

    req.io.emit("user_update", { action: "create", userId: newUser._id });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  updateUserProfile,
  getUserById,
  searchUsers,
  registerUser,
};
