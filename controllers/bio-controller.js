import { Types } from 'mongoose';
import LinksBio from '../models/LinksBio.js';

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
	console.log(req.body);
};

const handleUploadImage = async (req, res) => {
	console.log(req.body);
	// const image = await Image.create(req.body);
	// res.json(image);
};

export { editValuesBio, addLinkBio, editLinkBio, deleteLinkBio, reorderPositionLinksBio, handleUploadImage };

// const userBio = await LinksBio.aggregate([
// 	{ $match: { _id: new Types.ObjectId(req.body._id) } },
// 	{
// 		$set: { 'links.url': req.body.url },
// 	},
// 	{
// 		$project: {
// 			links: {
// 				$filter: {
// 					input: '$links',
// 					cond: { $eq: ['$$this._id', new Types.ObjectId(req.body.idLink)] },
// 				},
// 			},
// 		},
// 	},

// 	{
// 		$replaceRoot: {
// 			newRoot: {
// 				$arrayElemAt: ['$links', 0],
// 			},
// 		},
// 	},
// ]).then((res: any) => {
// 	console.log(res);
// });
