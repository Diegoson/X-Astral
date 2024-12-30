const { CreatePlug } = require('../lib/commands.js');

CreatePlug({
    command: 'sticker2img',
    category: 'converter',
    desc: 'Convert sticker to image.',
    execute: async (message, conn, match) => {
        if (!message.message || !message.message.stickerMessage) {
        return message.reply('_Please send a sticker_');}
        const media = await conn.downloadMediaMessage(message);
        if (media) {
        await conn.send(message.user, { image: media }, { caption: '*_Here is your image_*' });
        } else {}
    }
});
              
