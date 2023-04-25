const { Router } = require('express');
const { login, logout, register } = require('../controllers/authController');

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);

module.exports = router;
