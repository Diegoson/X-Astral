const { CreatePlug } = require('../lib/commands');
const axios = require('axios');
const CONFIG = require('../config');

CreatePlug({
    command: 'yts',
    category: 'search',
    desc: 'Search for YTS',
    execute: async (message, conn) => {
        const query = message.text.split(' ').slice(1).join(' ');
        if (!query) return message.reply('_Provide seach query_');
        const res = await axios.get(`${CONFIG.app.base_url}/api/cari/yts?query=${query}`);
        const movies = res.data.data.slice(0, 10);
        let cama = `*SEARCH*: \n================\n\n`;
        movies.forEach(movie => {
            cama += `${movie.rating}\n\n${movie.description}\n${movie.url}\n\n================\n\n`;
        });
        conn.send(cama.trim());
    },
});
          
