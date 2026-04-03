const express = require('express');
const authenticate = require('../middleware/authenticate');
const { register, login, verify } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', authenticate, verify);

module.exports = router;
