const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { checkPermissions } = require('../utils');
const Product = require('../models/Product');
const Order = require('../models/Order');

const fakeStripeAPI = async ({ amount, currency }) => {
	const client_secret = 'someRandomValue';
	return { client_secret, amount };
};

const createOrder = async (req, res) => {
	const { items: cartItems, tax, shippingFee } = req.body;

	if (!cartItems || cartItems.length < 1) {
		throw new BadRequestError('No cart items provided');
	}

	if (!tax || !shippingFee) {
		throw new BadRequestError('Please provide tax and shipping fee');
	}

	let orderItems = [];
	let subTotal = 0;

	for (const item of cartItems) {
		const dbProduct = await Product.findById(item.product);
		if (!dbProduct) {
			throw new NotFoundError(`No product with id: ${item.product}`);
		}
		// console.log(dbProduct);
		const { name, price, image, _id } = dbProduct;
		const singleOrderItem = {
			amount: item.amount,
			name,
			price,
			image,
			product: _id,
		};
		/* Add item to order */
		orderItems.push(singleOrderItem);

		/* Calculate subtotal */
		subTotal += item.amount * price;
	}
	/* Calculate total */
	const total = tax + shippingFee + subTotal;

	/* Get client secret */
	const paymentIntent = await fakeStripeAPI({
		amount: total,
		currency: 'usd',
	});

	const order = await Order.create({
		orderItems,
		tax,
		shippingFee,
		subTotal,
		total,
		clientSecret: paymentIntent.client_secret,
		user: req.user.userId,
	});

	res.status(StatusCodes.OK).json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
	const orders = await Order.find({});
	res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const getSingleOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const order = await Order.findById(orderId);
	if (!order) {
		throw new NotFoundError(`No order with id: ${orderId}`);
	}
	checkPermissions(req.user, order.user);
	res.status(StatusCodes.OK).json(order);
};

const getCurrentUserOrders = async (req, res) => {
	const { userId, name } = req.user;
	const orders = await Order.find({ user: userId });
	res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const updateOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const { paymentIntentId } = req.body;
	const order = await Order.findById(orderId);
	if (!orderId) {
		throw new NotFoundError(`No order with id: ${orderId}`);
	}
	checkPermissions(req.user, order.user);
	order.paymentIntentId = paymentIntentId;
	order.status = 'paid';
	await order.save();
	res.status(StatusCodes.OK).json({ status: 'success', order });
};

module.exports = {
	createOrder,
	getAllOrders,
	getCurrentUserOrders,
	getSingleOrder,
	updateOrder,
};
