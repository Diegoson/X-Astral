const { CreatePlug } = require('../lib/commands');
const YouTube = require('youtube-sr').default;

CreatePlug({
    command: 'yts',
    category: 'search',
    desc: 'Search for YouTube',
    execute: async (message, conn) => {
        const query = message.text.trim();
        if (!query) return message.reply('Please provide a search term');
        const videos = await YouTube.search(query, { limit: 18, safeSearch: true });
        if (!videos || videos.length === 0) return message.reply(`No_found "${query}".`);
        const res = videos.map((m, i) => `[${++i}] ${m.title} (${m.url})`).join("\n");
        await conn.send(message.user, { text: `*YouTube Search:* _${query}_\n\n${res}` }, { quoted: message });
    },
});
