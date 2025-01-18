const mongoose = require('mongoose');
require('dotenv').config();

const DBURL = process.env. MONGO_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(DBURL, {});
        console.log('MongoDB Connected...');
    }
    catch(err) {
        console.log(`An Error has occurred while connecting to the DB. Error: ${err}`);
        process.exit(1);
    }
}

module.exports = connectDB;