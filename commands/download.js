const { CreatePlug } = require('../lib/commands');
const fetch = require('node-fetch');
const facebook_dl, tiktok_dl = require('../lib/scrappers.js'); 

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

CreatePlug({
  command: 'tiktok',
  category: 'download',
  desc: 'Download tiktok vid',
  execute: async (message, conn, match) => {
    if (!match) return message.reply('_Please provide a tiktok url_');
    const v_data = await tiktok_dl(match);
    if (!v_data) return message.reply('_Could not retrieve_');
    await conn.send(message.user, { video: { url: v_data.playUrl }, caption: `*comments:* ${v_data.commentCount}\n*share count:* ${v_data.shareCount}\n*music author:* ${v_data.musicAuthor}`, }, { quoted: message });
  },
});
    
                                           
