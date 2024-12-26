const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.resolve(__dirname, `${process.env.NODE_ENV || 'development'}.env`)});

const CONFIG = {
    app: {
        session_name: process.env.SESSION_NAME || 'Naxor~f17f29aed7360244',
        botname: process.env.BOTNAME || 'X-ASTRAL',
        base_url: process.env.BASE_URL || 'https://api.yanzbotz.live/',
        mongodb: process.env.MONGODB_URL || '',
        version: require('./package.json').version,
        env: process.env.NODE_ENV || 'development',
        prefix: process.env.COMMAND_PREFIX || '?',
        mode: process.env.MODE || 'private',
        mods: process.env.MODS || '27686881509,27686567257'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    },
};

module.exports = CONFIG;
