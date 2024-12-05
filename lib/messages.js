const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function serialize(conn, message) {
    try {
        if (!message || !message.key) {
            console.error('Invalid message stru');
            return null;
        }

        const m = {
            ...message,
            id: message.key.id,
            uniqueId: message.key.id,
            contact: message.key.remoteJid,
            isGroup: message.key.remoteJid.endsWith('@g.us'),
            sender: message.key.participant || message.key.remoteJid,
            fromMe: message.key.fromMe,
            type: getContentType(message.message),
        };

        m.reply = async (text, options = {}) => {
            const sendOptions = options.quoted ? { quoted: message } : {};
            return conn.sendMessage(m.contact, { text, ...sendOptions });
        };
        m.downloadMedia = async () => {
            if (m.type && ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(m.type)) {
                const stream = await downloadContentFromMessage(
                    message.message[m.type], 
                    m.type.replace('Message', '')
                );
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            }
            throw new Error("Media download not supported for this message type");
        };

        m.text = (() => {
            if (!message.message) return '';   
            switch (m.type) {
                case 'conversation':
                    return message.message.conversation || '';
                case 'extendedTextMessage':
                    return message.message.extendedTextMessage?.text || '';
                case 'imageMessage':
                case 'videoMessage':
                case 'documentMessage':
                case 'audioMessage':
                    return message.message[m.type]?.caption || '';
                case 'buttonsMessage':
                    return message.message.buttonsMessage?.contentText || '';
                case 'listResponseMessage':
                    return message.message.listResponseMessage?.title || '';
                case 'reactionMessage':
                    return message.message.reactionMessage?.text || '';
                default:
                    return '';
            }
        })();

        m.quoted = (() => {
            const contextInfo = message.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo?.quotedMessage) return null;

            return {
                text: (() => {
                    const quotedType = getContentType(contextInfo.quotedMessage);
                    return contextInfo.quotedMessage[quotedType] || '';
                })(),
                sender: contextInfo.participant || '',
                messageId: contextInfo.stanzaId || '',
            };
        })();

        return m;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = { serialize };
