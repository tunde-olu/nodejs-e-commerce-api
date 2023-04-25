const express = require('express');
const {
	createProduct,
	deleteProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	uploadImage,
} = require('../controllers/productController');
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const { getSingleProductReviews } = require('../controllers/reviewController');

const router = express.Router();

router.route('/').get(getAllProducts);

router.route('/').post([authenticateUser, authorizePermissions('admin')], createProduct);
router.route('/upload-image').post([authenticateUser, authorizePermissions('admin')], uploadImage);

router
	.route('/:id')
	.get(getSingleProduct)
	.patch([authenticateUser, authorizePermissions('admin')], updateProduct)
	.delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
