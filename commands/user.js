
const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'whois',
    category: 'misc',
    desc: 'fetch user details',
    execute: async (message, conn, match) => {
        if(!match) return;
        const user = match || message.user;
        const { status, setAt } = await conn.fetchStatus(user).catch(() => ({}));
        const _image = await conn.profilePictureUrl(user, "image").catch(() => null);
        const name = user || message.pushName;
        await conn.send(message.user, { image: { url: _image, caption: `@${name}\nStatus: ${status || 'astral'}\nLast Updated: ${setAt ? new Date(setAt).toLocaleString() : 'unknown'}`, mentions: [user]
   
        }
               });
       }
});

CreatePlug({
    command: 'vv',
    category: 'user',
    desc: 'Convert view-once media',
    execute: async (message, conn, match) => {
        if (!message.message?.viewOnceMessage) return;
        const media = await conn.downloadMediaMessage(message.message.viewOnceMessage);
        if (!media) return message.reply('_err_');
        const _img = message.message.viewOnceMessage.message.imageMessage;
        if ((match === 'image' && _img) || (match === 'video' && !_img)) {
            const options = _img
                ? { image: media, caption: '*Your Image*' } 
                : { video: media, caption: '*Your Video*' };
            await conn.send(message.user, options);
        } else {}
    }
});
                                                
