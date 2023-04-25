const jwt = require('jsonwebtoken');

const createJWT = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
};

const isTokenValid = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = (res, payload) => {
	const oneDay = 1000 * 60 * 60 * 24;

	const token = createJWT(payload);

	res.cookie('token', token, {
		httpOnly: true,
		expires: new Date(Date.now() + oneDay),
		secure: process.env.NODE_ENV === 'production',
		signed: true,
	});
};

const createTokenUser = (user) => {
	return { userId: user._id, name: user.name, role: user.role };
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse, createTokenUser };
