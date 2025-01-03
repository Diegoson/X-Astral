
const { DataTypes } = require('sequelize');
const os = require('os');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true, trim: true },
    id: { type: DataTypes.STRING, allowNull: false },
    platform: { type: DataTypes.STRING, defaultValue: 'unknown' },
    uptime: { type: DataTypes.STRING, defaultValue: '0s' },
    memoryUsage: { type: DataTypes.STRING, defaultValue: '0MB' },
    alives: { type: DataTypes.STRING, defaultValue: `Bot Status:\n\nPlatform: {{platform}}\nUptime: {{uptime}}\nMemory Usage: {{memoryUsage}}\n\nI'm alive now 💘`,},
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false, });
User.beforeCreate(async (user, options) => {
    user.platform = os.platform();
    user.uptime = `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`;
    const memoryInMB = (os.totalmem() - os.freemem()) / (1024 * 1024);
    user.memoryUsage = `${memoryInMB.toFixed(2)}MB`;
});

User.prototype.generateAliveMessage = function () {
    return this.alives
        .replace('{{platform}}', this.platform)
        .replace('{{uptime}}', this.uptime)
        .replace('{{memoryUsage}}', this.memoryUsage);
};

sequelize.sync();
module.exports = User;
        
