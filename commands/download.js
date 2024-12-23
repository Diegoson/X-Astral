const { CreatePlug } = require('../lib/commands');
const fetch = require('node-fetch');
const facebook_dl = require('../lib/scrappers.js'); 

CreatePlug({
  command: 'fb',
  category: 'download',
  desc: 'Download fb vid',
  execute: async (message, conn, match) => {
    if (!match) return message.reply('_Please provide a Facebook URL_');
    const { "HD (720p)": hdUrl, "SD (360p)": sdUrl } = await facebook_dl(match);
    if (!hdUrl && !sdUrl) return message.reply('Not available');
    const video_version = hdUrl || sdUrl;
    const max = hdUrl ? 'HD (720p)' : 'SD (360p)';
    const res = await fetch(video_version);
    if (!res.ok) return message.reply('err');
    await conn.send(message.user, { video: { url: video_version }, caption: `\n*Quality*: ${max}` }, { quoted: message });
  },
});
                                           
