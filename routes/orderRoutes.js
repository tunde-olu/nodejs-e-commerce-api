const express = require('express');
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');
const {
	createOrder,
	getAllOrders,
	getCurrentUserOrders,
	getSingleOrder,
	updateOrder,
} = require('../controllers/orderController');

const router = express.Router();

router
	.route('/')
	.post(authenticateUser, createOrder)
	.get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/show-all-my-orders').get(authenticateUser, getCurrentUserOrders);

router.route('/:id').get(authenticateUser, getSingleOrder).patch(authenticateUser, updateOrder);

module.exports = router;
