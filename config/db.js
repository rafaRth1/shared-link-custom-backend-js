import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		mongoose.set('strictQuery', false);

		const connection = await mongoose.connect(process.env.MONGO_URI);

		const url = `${connection.connection.host}:${connection.connection.port}`;
		console.log(url);
	} catch (error) {
		console.log(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
