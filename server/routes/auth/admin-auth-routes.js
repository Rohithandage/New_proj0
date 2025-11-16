const express = require('express');
const router = express.Router();
const { adminLogin, verifyAdminToken } = require('../../controllers/auth/admin-auth-controller');

// Admin login
router.post('/login', adminLogin);

// Verify admin token
router.get('/verify', verifyAdminToken);

module.exports = router;








