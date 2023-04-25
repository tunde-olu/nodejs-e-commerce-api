const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
	const { name, email, password } = req.body;

	/* To give admin role to the first registered account */
	const isFirstAccount = (await User.countDocuments({})) === 0;
	const role = isFirstAccount ? 'admin' : 'user';

	const emailAlreadyExists = await User.findOne({ email });
	if (emailAlreadyExists) {
		throw new BadRequestError('Email already exists');
	}
	const user = await User.create({ name, email, password, role });
	const tokenUser = createTokenUser(user);

	attachCookiesToResponse(res, tokenUser);

	res.status(StatusCodes.CREATED).json({ tokenUser });
};
const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new BadRequestError('Please provide email and password');
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new UnauthenticatedError('Invalid credentials');
	}

	const isPasswordCorrect = await user.comparePassword(password);

	if (!isPasswordCorrect) {
		throw new UnauthenticatedError('Invalid password');
	}

	const tokenUser = createTokenUser(user);
	attachCookiesToResponse(res, tokenUser);

	res.status(StatusCodes.OK).json({ tokenUser });
};
const logout = async (req, res) => {
	res.clearCookie('token');

	res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = { register, login, logout };
