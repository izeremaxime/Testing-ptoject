import mongoose from 'mongoose';
import dotenv from 'dotenv-flow';

dotenv.config();

console.log('Connecting to database...');
console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to ${process.env.NODE_ENV} database`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default connectDB;
