const { BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
	const userId = req.user.userId;
	const { product: productId } = req.body;

	const isProductExist = await Product.findById(productId);
	if (!isProductExist) {
		throw new NotFoundError(`No product found with id: ${productId}`);
	}

	req.body.user = userId;
	req.body.product = productId;

	const alreadySubmitted = await Review.findOne({ product: productId, user: userId });
	if (alreadySubmitted) {
		throw new BadRequestError('Already submitted review for this product');
	}
	const review = await Review.create(req.body);
	res.status(StatusCodes.CREATED).json({ status: 'success', review });
};

const getAllReviews = async (req, res) => {
	const reviews = await Review.find({}).populate({
		path: 'product',
		select: ['name', 'company', 'price'],
	});

	res.status(StatusCodes.OK).json({ status: 'success', count: reviews.length, reviews });
};

const getSingleReview = async (req, res) => {
	const id = req.params.id;
	const review = await Review.findById(id);
	if (!review) {
		throw new NotFoundError(`No product found with id: ${id}`);
	}

	res.status(StatusCodes.OK).json({ status: 'success', review });
};

const updateReview = async (req, res) => {
	const { rating, title, comment } = req.body;
	if (!rating && !title && !comment) {
		throw new BadRequestError('Please provide at least one value');
	}
	const { id: productId } = req.params;

	const review = await Review.findById(productId);
	if (!review) {
		throw new NotFoundError(`No product with id: ${productId}`);
	}

	checkPermissions(req.user, review.user);

	review.rating = rating;
	review.title = title;
	review.comment = comment;

	await review.save();

	res.status(StatusCodes.OK).json({ status: 'success', msg: 'Review updated!', review });
};

const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const { product: productId } = req.body;
	const review = await Review.findById(reviewId);
	if (!review) {
		throw new BadRequestError(`No review with id: ${productId}`);
	}

	checkPermissions(req.user, review.user);

	await review.deleteOne();

	res.status(StatusCodes.OK).json({ status: 'success', msg: 'review successfully deleted' });
};

const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId });
	res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
};
