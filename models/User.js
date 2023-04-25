const mongoose = require('mongoose');
const validator = require('validator');
const { hashPassword, compareHashedPassword } = require('../utils');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide name'],
			minLength: 3,
			maxLength: 50,
		},
		email: {
			type: String,
			unique: true,
			required: [true, 'Please provide email'],
			validate: {
				validator: validator.isEmail,
				message: 'Please provide valid email',
			},
		},
		password: {
			type: String,
			required: [true, 'Please provide password'],
			minLength: 6,
		},
		role: {
			type: String,
			enum: ['admin', 'user'],
			default: 'user',
		},
	},
	{ timestamps: true }
);

UserSchema.pre('save', async function () {
	// console.log(this.modifiedPaths());

	if (!this.isModified('password')) return;

	this.password = await hashPassword(this.password);
});

UserSchema.methods.comparePassword = async function (passwd) {
	return compareHashedPassword(passwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
