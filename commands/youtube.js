const { CreatePlug } = require('../lib/commands');
const yts = require('yt-search');

CreatePlug({
  command: 'yts',
  category: 'search',
  desc: 'Search YouTube',
  execute: async (message, conn, match) => {
    if (!match || match.trim() === '') return message.reply('_Example: yts funny cat videos_');
    var args = match.trim();
    const results = await yts(args);
    if (!results || !results.videos || results.videos.length === 0) return;
      const msg = results.videos.slice(0, 18);
       const res = `*YouTube Search:*` + 
      msg.filter(video => {
        const parts = video.timestamp.split(':');
        const mmm = parts.length === 2 ? parseInt(parts[0]) : parseInt(parts[0]); return mmm >= 18;
      }).map(({ title, timestamp, views, ago, url }, index) => 
        `{${index + 1}. ${title}}\n{Duration: ${timestamp}}\n{Views: ${views}}\n{Uploaded: ${ago}}\n{${url}}`
      ).join('\n\n');
    if (!res) return;
       await conn.send(message.user, { text: res }, { quoted: message });
  },
});
        
