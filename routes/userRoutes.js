const express = require('express');
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
} = require('../controllers/userController');

const router = express.Router();

router.route('/').get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers);
router.route('/show-user').get(authenticateUser, showCurrentUser);
router.route('/update-user').patch(authenticateUser, updateUser);
router.route('/update-user-password').patch(authenticateUser, updateUserPassword);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;
