const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const connectDB = async () => {
    try {
        let MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            console.log("⚠️  No MONGO_URI found in environment. Starting MongoMemoryServer...");
            const mongoServer = await MongoMemoryServer.create();
            MONGO_URI = mongoServer.getUri();
            process.env.MONGO_URI = MONGO_URI; // Set it back for the seed script
        }

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`🚀 Database connected: ${conn.connection.host} (${MONGO_URI})`);
    } catch (err) {
        console.error(`❌ Database connection error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
