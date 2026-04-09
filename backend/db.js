const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// Event Listeners
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment");
        }

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`🚀 Database connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Database connection error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
