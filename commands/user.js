const { CreatePlug } = require('../lib/commands');
const translate = require('@vitalets/google-translate-api'); 
const gTTS = require('gtts');
const CONFIG = require('../config');


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

CreatePlug({
    command: 'tr',
    category: 'mics',
    desc: 'Translate',
    execute: async (message, conn, match) => {
        if (!match) return;
        const [lang, ...text] = match.split(' ');
        if (!lang || text.length === 0) return message.reply('!tr [language_] [text]');
        const result = await translate(text.join(' '), { to: lang }).catch(() => null);
        if (!result) return message.reply('_err_');
        message.reply(`${result.text}`);
    }
});

CreatePlug({
    command: 'tts',
    category: 'convert',
    desc: 'speech',
    execute: async (message, conn, match) => {
        if (!match) return message.reply('_nned text_');
        const tts = new gTTS(match, 'en');
        const path = '/tmp/tts.mp3';
        tts.save(path, async (err) => {
            if (err) return message.reply('_err_');
            await conn.send(message.user, { audio: { url: path }, mimetype: 'audio/mp4' });
         });
    }
});

const getChats = async (conn) => {
    const chats = await conn.chats.all();
    return { groups: chats.filter(chat => chat.id.endsWith('@g.us')), users: chats.filter(chat => !chat.id.endsWith('@g.us')) };
};

CreatePlug({
    command: 'broadcast',
    category: 'admin',
    desc: '_Broadcast msgs_',
    execute: async (message, conn, match, owner) => {
        if (!owner) return; 
        if (!match) return await message.reply('_msg required_');
        const { groups, users } = await getChats(conn);
        if (!groups.length && !users.length) return;
        const _msg = `----🗣️ *Broadcast Message* 🗣️----\n*Author:* *${CONFIG.app.botname}*\n\n${match}`.trim();
        const _img = 'https://i.imgur.com/Lu1doPs.jpeg';
        for (const group of groups) {
            const gc_name = (await conn.groupMetadata(group.id)).subject || '_';
            await conn.send(group.id, { image: { url: _img }, caption: `${_msg}` });
        }  for (const user of users) {
            await conn.send(user.id, { image: { url: _img }, caption: `${_msg}` });}
        await message.reply('*_success_*');
    }
});

CreatePlug({
    command: 'getgc',
    category: 'admin',
    desc: 'groups',
    execute: async (message, conn, match, owner) => {
        if(!owner) return;
        const groups = await getChats(conn);
        const mime = await Promise.all(groups.map(async (group, index) => {
            const nama = await conn.groupMetadata(group.id);
            const nema = nama.subject;
            return `${index + 1}. ${nema}\n   *Jid:* ${group.id}\n   *Id:* ${group.id}`;
        })); await conn.send(message.user, { text: `*Groups:*\n${mime.join('\n\n')}`);
    }
});

