import { Schema, model } from 'mongoose';

export const LinksSchema = new Schema(
	{
		url: {
			type: String,
			require: String,
			trim: true,
		},

		platformName: {
			type: String,
			require: String,
			trim: true,
		},

		customName: {
			type: String,
			require: String,
			trim: true,
		},

		position: {
			type: Number,
			require: String,
		},
	},
	{
		timestamps: true,
	}
);

const Links = model('Links', LinksSchema);

export default Links;
