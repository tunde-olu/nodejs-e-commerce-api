const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
};

const compareHashedPassword = async (password, hash) => {
	return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, compareHashedPassword };
