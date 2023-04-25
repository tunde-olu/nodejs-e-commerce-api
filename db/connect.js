const mongoose = require('mongoose');

const connectDB = (uri) => {
	return mongoose.connect(uri, {
		dbName: '10-E-commerce-API',
	});
};

module.exports = connectDB;
