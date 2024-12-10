const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function serialize(conn, message) {
    try {   
        // Tambahkan pemeriksaan awal untuk message dan message.key
        if (!message || !message.key) {
            console.error('Invalid message object');
            return null;
        }

        message.id = message.key.id;
        message.isGroup = message.key.remoteJid && message.key.remoteJid.endsWith('@g.us');
        message.sender = message.isGroup 
            ? (message.key.participant || message.key.remoteJid)
            : message.key.remoteJid;
        message.user = message.key.remoteJid;
        message.isFromMe = message.key.fromMe;

        // Pemeriksaan untuk message.message
        if (!message.message) {
            message.message = {};
        }

        const type = getContentType(message.message);
        message.type = type || 'unknown';
        message.content = type ? message.message[type] : null;

        // Penanganan teks dengan pemeriksaan yang lebih aman
        message.text = '';
        if (type === 'conversation') {
            message.text = message.message.conversation || '';
        } else if (type === 'extendedTextMessage' && message.message.extendedTextMessage) {
            message.text = message.message.extendedTextMessage.text || '';
        } else if (type === 'imageMessage' && message.message.imageMessage) {
            message.text = message.message.imageMessage.caption || '';
        } else if (type === 'videoMessage' && message.message.videoMessage) {
            message.text = message.message.videoMessage.caption || '';
        } else if (type === 'documentMessage' && message.message.documentMessage) {
            message.text = message.message.documentMessage.caption || '';
        } else if (type === 'audioMessage' && message.message.audioMessage) {
            message.text = message.message.audioMessage.caption || '';
        } else if (type === 'listResponseMessage' && message.message.listResponseMessage) {
            message.text = message.message.listResponseMessage.title || '';
        } else if (type === 'buttonMessage' && message.message.buttonMessage) {
            message.text = message.message.buttonMessage.text || '';
        } else if (type === 'reactionMessage' && message.message.reactionMessage) {
            message.text = message.message.reactionMessage.text || '';
        }

        message.media = async () => {
            if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(type)) {
                try {
                    const stream = await downloadContentFromMessage(message.message[type], type.replace('Message', ''));
                    const buffer = [];
                    for await (const chunk of stream) {
                        buffer.push(chunk);
                    }
                    return Buffer.concat(buffer);
                } catch (error) {
                    console.error('Error downloading media:', error);
                    return null;
                }
            }
            return null;
        };

        // Pemeriksaan aman untuk mentions
        message.mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        // Pemeriksaan untuk pesan group
        if (message.isGroup) {
            try {
                const groupMetadata = await conn.groupMetadata(message.user);
                message.groupParticipants = groupMetadata.participants.map(participant => participant.id);
                message.groupAdmins = groupMetadata.participants
                    .filter(participant => participant.admin === 'admin' || participant.admin === 'superadmin')
                    .map(admin => admin.id);
                message.groupSize = groupMetadata.participants.length;
                
                const naxorJid = conn.user.id;
                message.isBotAdmin = message.groupAdmins.includes(naxorJid);
            } catch (groupError) {
                console.error('Error fetching group metadata:', groupError);
                message.groupParticipants = [];
                message.groupAdmins = [];
                message.groupSize = 0;
                message.isBotAdmin = false;
            }
        } else {
            message.isBotAdmin = false; 
        }

        // Tambahkan penanganan default untuk metode reply, forward, dll.
        message.reply = (text, options = {}) => {
            if (!message.user) {
                console.error('Cannot reply: No user found');
                return Promise.reject(new Error('No user found'));
            }
            return conn.sendMessage(message.user, { text }, { quoted: message, ...options });
        };

        message.forward = (jid, options = {}) => {
            if (!jid) {
                console.error('Cannot forward: No jid provided');
                return Promise.reject(new Error('No jid provided'));
            }
            return conn.sendMessage(jid, { text: message.text }, { quoted: null, ...options });
        };

        message.mention = async (text, users, options = {}) => {
            if (!message.user || !users) {
                console.error('Cannot mention: Missing user or mentions');
                return Promise.reject(new Error('Missing user or mentions'));
            }
            return conn.sendMessage(message.user, { text, mentions: users }, { quoted: message, ...options });
        };

        message.react = async (emoji) => {
            if (!emoji) {
                console.error('No emoji provided for reaction');
                return Promise.reject(new Error('No emoji provided'));
            }
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
        console.error('Serialize error:', err);
        return null;
    }
}

module.exports = { serialize };