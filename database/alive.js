const mongoose = require('mongoose');
const os = require('os');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    id: { type: String, required: true },
    platform: { type: String, default: "unknown" },
    uptime: { type: String, default: "0s" },
    memoryUsage: { type: String, default: "0MB" },
    alives: { type: String, default: `Bot Status:\n\nPlatform: {{platform}}\nUptime: {{uptime}}\nMemory Usage: {{memoryUsage}}\n\nIm alive now 💘`},
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }});
    userSchema.pre('save', function (next) {
    this.platform = os.platform();
    this.uptime = `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`;
    const memoryInMB = (os.totalmem() - os.freemem()) / (1024 * 1024);
    this.memoryUsage = `${memoryInMB.toFixed(2)}MB`;
    next();});
    userSchema.methods.generateAliveMessage = function () {
    return this.alives
        .replace('{{platform}}', this.platform)
        .replace('{{uptime}}', this.uptime)
        .replace('{{memoryUsage}}', this.memoryUsage);
};

module.exports = mongoose.model('User', userSchema);
