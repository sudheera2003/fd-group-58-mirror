const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User');
const { getUsers, updateUserRole, deleteUser, updateUserProfile, getUserById, searchUsers, registerUser } = require('../controllers/userController');

// Path is just '/search' because index.js adds '/api/users'
router.get('/search', searchUsers);
router.get('', getUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);
router.put('/:id', updateUserProfile);
router.get('/:id', getUserById);
router.post('/register', registerUser);
module.exports = router;