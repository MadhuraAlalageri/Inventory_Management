const express = require('express');
const router = express.Router();

const { login, addUser, changePassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', addUser);
router.post('/change-password', changePassword);

module.exports = router;