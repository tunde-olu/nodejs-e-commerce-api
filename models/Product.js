const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Please provide product name'],
			maxLength: [100, 'Name can not be more than 100 characters'],
		},
		price: {
			type: Number,
			required: [true, 'Please provide product price'],
			default: 0,
		},
		description: {
			type: String,
			trim: true,
			required: [true, 'Please provide product description'],
			maxLength: [1000, 'Name can not be more than 1000 characters'],
		},
		image: {
			type: String,
			default: '/uploads/example.jpeg',
		},
		category: {
			type: String,
			required: [true, 'Please provide product category'],
			enum: ['office', 'kitchen', 'bedroom'],
		},
		company: {
			type: String,
			required: [true, 'Please provide company'],
			enum: {
				values: ['ikea', 'liddy', 'marcos'],
				message: '{VALUE} is not supported',
			},
		},
		colors: {
			type: [String],
			default: ['#222'],
			required: [true, 'Please provide colors'],
		},
		featured: {
			type: Boolean,
			required: false,
		},
		freeShipping: {
			type: Boolean,
			required: false,
		},
		inventory: {
			type: Number,
			required: true,
			default: 15,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		numOfReviews: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			default: '6439be5576c930f4851abfaf',
			required: true,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'product',
	justOne: false,
});

ProductSchema.pre('deleteOne', { document: true }, async function () {
	await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);
