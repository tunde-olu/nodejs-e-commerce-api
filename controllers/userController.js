const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { attachCookiesToResponse, createTokenUser, checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
	const user = await User.find({ role: 'user' }).select('-password');

	res.status(StatusCodes.OK).json({ user: user, count: user.length });
};

const getSingleUser = async (req, res) => {
	const userId = req.params.id;
	/* console.log(req.user); */

	const user = await User.findById(userId).select('-password');
	if (!user) {
		throw new NotFoundError(`No user with id: ${userId}`);
	}
	checkPermissions(req.user, user._id);

	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
	const { name, email } = req.body;
	if (!name || !email) {
		throw new BadRequestError('Please provide all the value');
	}

	const userId = req.user.userId;

	/* update user with findOneAndUpdate */
	// const user = await User.findOneAndUpdate(
	// 	{ _id: userId },
	// 	{ name, email },
	// 	{
	// 		runValidators: true,
	// 		new: true,
	// 	}
	// );

	const user = await User.findById(userId);
	user.name = name;
	user.email = email;
	await user.save();

	const tokenUser = createTokenUser(user);
	attachCookiesToResponse(res, tokenUser);

	res.status(StatusCodes.OK).json({ status: 'Success', user: tokenUser });
};

const updateUserPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new BadRequestError('Please provide both old and new password!');
	}

	const user = await User.findById(req.user.userId);
	if (!user) {
		throw new UnauthenticatedError('Authentication Invalid');
	}

	const isPasswordValid = await user.comparePassword(oldPassword);
	if (!isPasswordValid) {
		throw new UnauthenticatedError('Old password is incorrect');
	}

	user.password = newPassword;
	await user.save();
	res.status(StatusCodes.OK).json({ status: 'Success', msg: 'Password updated' });
};

module.exports = {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
};
