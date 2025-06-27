const mongoose = require('mongoose');

module.exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}