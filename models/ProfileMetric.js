import { Schema, model } from 'mongoose';

const ProfileMetricSchema = new Schema({
	views: {
		totalViews: [
			{
				key: String,
				value: Number,
				users: Array,
			},
		],

		total: Number,
	},

	clicks: {
		type: Number,
		require: true,
	},

	subscribers: {
		type: Number,
		require: true,
	},

	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

const ProfileMetric = model('ProfileMetric', ProfileMetricSchema);

export default ProfileMetric;
