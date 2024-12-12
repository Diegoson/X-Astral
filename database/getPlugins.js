const mongoose = require("mongoose");
const pluginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['loaded', 'error', 'not_found'],
        default: 'not_found'
    },
    path: {
        type: String,
        required: true
    },
    error: {
        type: String,
        default: null
    },
    loadedAt: {
        type: Date,
        default: Date.now
    }
});

const Plugin = mongoose.model('Plugin', pluginSchema);
module.exports = Plugin;
  
