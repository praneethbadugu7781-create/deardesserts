import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deardessertsin_db_user:1r9Kf1OwhyQgBksS@cluster0.hv1zy6r.mongodb.net/dear_desserts?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`🍃 Connected to MongoDB Atlas Database: ${conn.connection.name} at ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas Connection Error:', error.message);
    return false;
  }
};
