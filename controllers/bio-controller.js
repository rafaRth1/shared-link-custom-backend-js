import { Types } from 'mongoose';
import LinksBio from '../models/LinksBio.js';
import ProfileMetric from '../models/ProfileMetric.js';

const editValuesBio = async (req, res) => {
	const { _id, title, description, imageProfile, bannerImage } = req.body;
	const userBio = await LinksBio.findById({ _id }).select('-createdAt -updatedAt -__v -updatedAt');

	if (!userBio) {
		const error = new Error('No encontrado');
		return res.status(404).json({ msg: error.message });
	}

	userBio.title = title || userBio.title;
	userBio.description = description || userBio.description;
	userBio.imageProfile = imageProfile || userBio.imageProfile;
	userBio.bannerImage = bannerImage || userBio.bannerImage;

	try {
		const userBioUpdate = await userBio.save();

		res.json({
			linkBio: userBioUpdate,
		});
	} catch (error) {
		console.log(error);
	}
};

const addLinkBio = async (req, res) => {
	const { idBio, url, customName, platformName, position } = req.body;
	const userBio = await LinksBio.findById({ _id: idBio });
	const link = await userBio?.links.create({ url, customName, platformName, position: position });

	userBio?.links.push(link);

	try {
		await userBio?.save();

		return res.json({
			link,
			links: userBio?.links,
		});
	} catch (error) {
		console.log(error);
	}

	console.log(link);
};

const editLinkBio = async (req, res) => {
	const userBio = await LinksBio.findOneAndUpdate(
		{
			_id: new Types.ObjectId(req.body._id),
			'links._id': new Types.ObjectId(req.body.idLink),
		},
		{
			$set: { 'links.$.url': req.body.url, 'links.$.customName': req.body.custonName },
		},

		{
			projection: { links: { $elemMatch: { _id: new Types.ObjectId(req.body.idLink) } }, _id: 0 },
			returnDocument: 'after',
			returnNewDocument: true,
		}
	);

	if (!userBio) {
		const error = new Error('No encontrado');
		return res.status(404).json({ msg: error.message });
	}

	res.json({
		linkUpdate: userBio.links[0],
	});
};

const deleteLinkBio = async (req, res) => {
	const userBio = await LinksBio.findById({ _id: req.body.idLinkBio });

	userBio?.links.pull(req.params.id);

	try {
		await userBio?.save();

		res.json({
			userBio,
		});
	} catch (error) {
		console.log(error);
	}
};

const reorderPositionLinksBio = async (req, res) => {
	console.log(req.params);
};

const handleUploadImage = async (req, res) => {
	console.log(req.body);
	// const image = await Image.create(req.body);
	// res.json(image);
};

const storageViews = async (req, res) => {
	/*
		id_user_browser = string;
		id_profile = string;
	*/

	const { id_profile, id_user_browser } = req.body;

	const today = new Date().toISOString().slice(0, 10);

	const lastElementTotalViews = await ProfileMetric.aggregate([
		{
			$match: {
				user: new Types.ObjectId(id_profile),
			},
		},
		{
			$project: {
				lastElement: {
					$arrayElemAt: ['$views.totalViews', -1],
				},
			},
		},
	]);

	if (today !== lastElementTotalViews[0].lastElement.key.slice(0, 10)) {
		await ProfileMetric.findOneAndUpdate(
			{
				user: id_profile,
			},
			{
				$push: {
					'views.totalViews': {
						_id: new Types.ObjectId(),
						key: new Date().toISOString(),
						value: '0',
					},
				},
			}
		);
	}

	await ProfileMetric.findOneAndUpdate(
		{
			user: id_profile,
		},
		[
			{
				$set: {
					lastItem: { $last: '$views.totalViews' },
					rest: { $slice: ['$views.totalViews', 0, { $subtract: [{ $size: '$views.totalViews' }, 1] }] },
				},
			},
			{
				$addFields: {
					'views.total': {
						$cond: {
							if: {
								$in: ['5010064645373612500053736', '$views.users'],
							},
							then: '$views.total',
							else: { $add: ['$views.total', 1] },
						},
					},
				},
			},
			{
				$addFields: {
					'lastItem.value': {
						$cond: {
							if: {
								$not: { $in: [id_user_browser, '$views.users'] },
							},
							then: lastElementTotalViews[0].lastElement.value + 1,
							else: lastElementTotalViews[0].lastElement.value,
						},
					},
				},
			},
			{
				$set: {
					'views.users': {
						$concatArrays: [
							{
								$filter: {
									input: '$views.users',
									cond: {
										$ne: ['$$this', id_user_browser],
									},
								},
							},
							[id_user_browser],
						],
					},
				},
			},
			{
				$set: {
					'views.totalViews': { $concatArrays: ['$rest', ['$lastItem']] },
					lastItem: '$$REMOVE',
					rest: '$$REMOVE',
				},
			},
		]
	);
};

const getProfileMetric = async (req, res) => {
	/**
		start: "2024-06-08T00:00:00.000Z", string
    	end" "2024-06-01T00:00:00.000Z", string
    	user: "66080176496404d19d48ae8b" string
	 */

	const { user, start, end } = req.body;

	const profileMetric = await ProfileMetric.aggregate([
		{
			$match: {
				user: new Types.ObjectId(user),
			},
		},
		{
			$project: {
				totalViews: {
					list: {
						$filter: {
							input: '$views.totalViews',
							as: 'item',
							cond: {
								$and: [{ $gte: ['$$item.key', new Date(end)] }, { $lte: ['$$item.key', new Date(start)] }],
							},
						},
					},
					total: '$views.total',
				},

				totalClicks: {
					list: {
						$filter: {
							input: '$views.totalViews',
							as: 'item',
							cond: {
								$and: [{ $gte: ['$$item.key', new Date(end)] }, { $lte: ['$$item.key', new Date(start)] }],
							},
						},
					},
					total: '$views.total',
				},
			},
		},
	]);

	res.json({ profileMetric: profileMetric[0] });
};

const getProfileMetricWithDate = async (req, res) => {
	/*
    	start: "2024-06-08T00:00:00.000Z", string
    	end" "2024-06-01T00:00:00.000Z", string
    	user: "66080176496404d19d48ae8b" string
	*/

	const { user, start, end } = req.body;

	const profileMetric = await ProfileMetric.aggregate([
		{
			$match: {
				user: new Types.ObjectId(user),
			},
		},

		{
			$project: {
				'data.totalViews': {
					$filter: {
						input: '$views.totalViews',
						as: 'item',
						cond: {
							$and: [{ $gte: ['$$item.key', new Date(end)] }, { $lte: ['$$item.key', new Date(start)] }],
						},
					},
				},
			},
		},
	]);

	res.json({ profileMetric });
};

export {
	editValuesBio,
	addLinkBio,
	editLinkBio,
	deleteLinkBio,
	reorderPositionLinksBio,
	handleUploadImage,
	storageViews,
	getProfileMetric,
	getProfileMetricWithDate,
};
