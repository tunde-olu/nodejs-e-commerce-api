const agg = [
	{
		$match: {
			product: new ObjectId('643ecc8c477fea7c8d74c5b4'),
		},
	},
	{
		$group: {
			_id: null,
			averageRating: {
				$avg: '$rating',
			},
			numOfReviews: {
				$sum: 1,
			},
		},
	},
];
