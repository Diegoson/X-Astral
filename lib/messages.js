const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function serialize(conn, message) {
    try {   
        message.id = message.key.id;
        message.isGroup = message.key.remoteJid.endsWith('@g.us');
        message.sender = message.isGroup ? message.key.participant : message.key.remoteJid;
        message.user = message.key.remoteJid;
        message.isFromMe = message.key.fromMe;


        const type = getContentType(message.message);
        message.type = type;
        message.content = message.message[type];
        if (type === 'conversation') {
            message.text = message.message.conversation;
        } else if (type === 'extendedTextMessage') {
            message.text = message.message.extendedTextMessage.text;
        } else if (type === 'imageMessage' && message.message.imageMessage.caption) {
            message.text = message.message.imageMessage.caption;
        } else if (type === 'videoMessage' && message.message.videoMessage.caption) {
            message.text = message.message.videoMessage.caption;
        } else if (type === 'documentMessage' && message.message.documentMessage.caption) {
            message.text = message.message.documentMessage.caption;
        } else if (type === 'audioMessage' && message.message.audioMessage.caption) {
            message.text = message.message.audioMessage.caption;
        } else if (type === 'listResponseMessage') {
            message.text = message.message.listResponseMessage.title;
        } else if (type === 'buttonMessage') {
            message.text = message.message.buttonMessage.text;
        } else if (type === 'reactionMessage') {
            message.text = message.message.reactionMessage.text;
        } else {
            message.text = ''; 
        }

        message.media = async () => {
            if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(type)) {
                const stream = await downloadContentFromMessage(message.message[type], type.replace('Message', ''));
                const buffer = [];
                for await (const chunk of stream) {
                buffer.push(chunk);
                }
                return Buffer.concat(buffer);
            }
            return null;
        };

       message.mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (message.isGroup) {
            const groupMetadata = await conn.groupMetadata(message.user);
            message.groupParticipants = groupMetadata.participants.map(participant => participant.id);
            message.groupAdmins = groupMetadata.participants
                .filter(participant => participant.admin === 'admin' || participant.admin === 'superadmin')
                .map(admin => admin.id);
            message.groupSize = groupMetadata.participants.length;
            const naxorJid = conn.user.id;
            message.isBotAdmin = message.groupAdmins.includes(naxorJid);
        } else {
            message.isBotAdmin = false; 
        }

        message.reply = (text, options = {}) => {
            return conn.send(message.user, { text }, { quoted: message, ...options });
        };
        message.forward = (jid, options = {}) => {
            return conn.send(jid, message.content, { quoted: null, ...options });
        };
        message.mention = async (text, users, options = {}) => {
            return conn.send(message.user, { text, mentions: users }, { quoted: message, ...options });
        };
        message.react = async (emoji) => {
            if (conn.relayMessage) {
                return conn.relayMessage(message.user, {
                    reactMessage: {
                        key: message.key,
                        text: emoji,
                    },
                });
            }
        };

        return message;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { serialize };
            
