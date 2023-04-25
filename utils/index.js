const { createJWT, isTokenValid, attachCookiesToResponse, createTokenUser } = require('./jwt');
const checkPermissions = require('./checkPermissions');
const { hashPassword, compareHashedPassword } = require('./bcrypt');

module.exports = {
	createJWT,
	isTokenValid,
	attachCookiesToResponse,
	createTokenUser,
	checkPermissions,
	hashPassword,
	compareHashedPassword,
};
