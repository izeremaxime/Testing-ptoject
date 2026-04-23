import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'todo-app',
    });
    console.log(`Connected to ${process.env.NODE_ENV} database`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;