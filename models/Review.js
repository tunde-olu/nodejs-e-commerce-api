const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
	{
		rating: {
			type: Number,
			min: [1, 'Please choose a rating between 1 - 5'],
			max: [5, 'Please choose a rating between 1 - 5'],
			required: [true, 'Please provide rating'],
		},
		title: {
			type: String,
			trim: true,
			required: [true, 'Please provide review title'],
			maxLength: 100,
		},
		comment: {
			type: String,
			required: [true, 'Please provide review text'],
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		product: {
			type: mongoose.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
	},
	{ timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
	const result = await this.aggregate([
		{ $match: { product: productId } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: '$rating' },
				numOfReviews: { $sum: 1 },
			},
		},
	]);

	try {
		await this.model('Product').findByIdAndUpdate(productId, {
			averageRating: Math.ceil(result[0]?.averageRating || 0),
			numOfReviews: result[0]?.numOfReviews || 0,
		});
	} catch (error) {
		console.log(error);
	}

	console.log(result);
};

ReviewSchema.post('save', { document: true }, async function () {
	await this.constructor.calculateAverageRating(this.product);
	console.log('post save hook called');
});

ReviewSchema.post('deleteOne', { document: true }, async function () {
	await this.constructor.calculateAverageRating(this.product);
	console.log('post remove hook called');
});

module.exports = mongoose.model('Review', ReviewSchema);
