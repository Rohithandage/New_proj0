const express = require('express');
const router = express.Router();
const { userLogin, userRegister, verifyUserToken } = require('../../controllers/auth/user-auth-controller');

// User login
router.post('/login', userLogin);

// User register
router.post('/register', userRegister);

// Verify user token
router.get('/verify', verifyUserToken);

module.exports = router;







