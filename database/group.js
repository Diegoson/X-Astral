const { DataTypes } = require('sequelize');

const Group = sequelize.define('Group', {
    id: { type: DataTypes.STRING, primaryKey: true },
    welcome: { type: DataTypes.STRING, defaultValue: "*Welcome*: @pushname\n*To*: @gc_name\n*Member*: @number\n*Time*: @time" },
    goodbye: { type: DataTypes.STRING, defaultValue: "*Goodbye*: @pushname\n*From*: @gc_name\n*Time*: @time\n*Negro dusted*" }
}, { timestamps: false });

async function groups(id) {
    return await Group.findOrCreate({ where: { id } });
}

module.exports = { groups };
