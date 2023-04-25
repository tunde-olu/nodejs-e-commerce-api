const { StatusCodes } = require('http-status-codes');
const { isTokenValid } = require('../utils/jwt');
const { UnauthenticatedError, UnauthorizedError } = require('../errors');

const authenticateUser = async (req, res, next) => {
	const token = req.signedCookies.token;

	if (!token) {
		throw new UnauthenticatedError('Authentication Invalid');
	}

	try {
		const payload = isTokenValid(token);
		const { userId, name, role } = payload;
		req.user = { userId, name, role };
		next();
	} catch (error) {
		throw new UnauthenticatedError('Authentication Invalid');
	}
};

const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new UnauthorizedError('Unauthorized to access this route');
		}
		next();
	};
};

module.exports = {
	authenticateUser,
	authorizePermissions,
};
