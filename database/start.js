const mongoose = require('mongoose');
const AstralScheme = new mongoose.Schema({
	botName: {
		type: String,
		default: 'XAstral',
	},
	version: {
		type: String,
		default: '4.0.0',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Asena = mongoose.model('Asena', AstralScheme);
async function getMongoDB(CONFIG) {
	try {
    const mongo_url = CONFIG.app.mongodb;
		if (!mongo_url) {
		console.log('Mongo_string(url) is required');}
		await mongoose.connect(mongo_url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		});
		console.log('Connected to MongoDB 👍');
		const config = await Asena.findOne();
		if (!config) {
		console.log('Please set up_configurations');
		}} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}

module.exports = { Asena, getMongoDB };
