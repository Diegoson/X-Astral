const CONFIG = require('../config');
const mongoose = require('mongoose');

async function getMongoDB() {
    const mongo_url = CONFIG.app.mongodb;
    if (!mongo_url) {
        console.log('MongoDB connection string (URL) is required');
        return;}
    mongoose
        .connect(mongo_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }) .catch((error) => {
            console.error(`${error.message}`);
            process.exit(1); 
        });
}

module.exports = { getMongoDB };
