const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.resolve(__dirname, `${process.env.NODE_ENV || 'development'}.env`)});

const CONFIG = {
    app: {
        session_name: process.env.SESSION_NAME || '',
        botname: process.env.BOTNAME || 'X-ASTRAL',
        base_url: process.env.BASE_URL || '',
        mongodb: process.env.MONGODB_URL || '',
        version: require('./package.json').version,
        env: process.env.NODE_ENV || 'development',
        prefix: process.env.COMMAND_PREFIX || '?',
        mode: process.env.MODE || 'private',
        mods: process.env.MODS || '27686881509,27686567257'
    },
};

module.exports = CONFIG;
