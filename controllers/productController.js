const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, NotFoundError, CustomAPIError } = require('../errors');
const Product = require('../models/Product');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const data = require('../mockData/products.json');

const createProduct = async (req, res) => {
	req.body.user = req.user.userId;
	const product = await Product.create(data);
	res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
	const products = await Product.find({});
	res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findById(productId).populate('reviews');
	if (!product) {
		throw new NotFoundError(`No product with id: ${productId}`);
	}

	res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findByIdAndUpdate(productId, req.body, {
		runValidators: true,
		new: true,
	});
	if (!product) {
		throw new NotFoundError(`No product found with id: ${productId}`);
	}
	res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findById(productId);

	if (!product) {
		throw new NotFoundError(`No product found with id: ${productId}`);
	}

	// await Review.deleteMany({ product: product._id });

	await product.deleteOne();

	res.status(StatusCodes.OK).json({ status: 'Success', msg: 'Product removed' });
};

const uploadImage = async (req, res) => {
	if (!req.files) {
		throw new BadRequestError('No File Uploaded');
	}
	const productImage = req.files.image;
	console.log(productImage);

	if (!productImage.mimetype.startsWith('image')) {
		throw new BadRequestError('Please Upload Image');
	}

	const maxSize = 1024 * 1024;
	if (productImage.size > maxSize) {
		throw new CustomAPIError(
			'Please upload image smaller than 1MB',
			StatusCodes.REQUEST_TOO_LONG
		);
	}

	const cloudImage = await cloudinary.uploader.upload(productImage.tempFilePath, {
		use_filename: true,
		folder: 'e-commerce project',
	});
	const imageCloud = cloudImage.secure_url;

	const imagePath = path.join(__dirname, '../public/uploads/', productImage.name);
	await productImage.mv(imagePath);

	res.status(StatusCodes.CREATED).json({
		image: `/public/uploads/${productImage.name}`,
		imageCloud,
	});
};

module.exports = {
	createProduct,
	deleteProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	uploadImage,
};
