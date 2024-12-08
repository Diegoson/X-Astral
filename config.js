const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
path: path.resolve(__dirname, `${process.env.NODE_ENV || 'development'}.env`)
});

const CONFIG = {
    app: {
        session_name: process.env.SESSION_NAME || 'X-Astra',
        port: process.env.PORT || 3000,
        language: process.env.LANGUAGE || 'en',
        botname: process.env.BOTNAME || 'X-ASTRAL',
        version: require('./package.json').version,
        env: process.env.NODE_ENV || 'development',
        prefix: process.env.COMMAND_PREFIX || '.',
        mode: process.env.MODE || 'private',
        mods: process.env.MODS || '27686881509,27686567257,27828418477'
    
    },
   features: {
            add: true,      
            remove: true,   
            promote: true,  
            demote: false,  
   },  
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    },
    api: {
       base_url: process.env.BASE_URL || ' '
    },
    error: {
        repli: 'Reply to something',
        name: 'Provide a name/tilte',
        admin: 'Admin access only',
        link: 'Provide a link',
        errors: 'An error occurred by_',
    }
};

module.exports = CONFIG;
