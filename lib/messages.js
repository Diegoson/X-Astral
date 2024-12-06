const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function serialize(conn, message) {
    try {
        if (!message || !message.key) {
            console.error('Invalid message structure');
            return null;
        }

        message = {
            ...message,
            id: message.key.id,
            uniqueId: message.key.id,
            user: message.key.remoteJid, 
            isGroup: message.key.remoteJid.endsWith('@g.us'),
            sender: message.key.participant || message.key.remoteJid,
            fromMe: message.key.fromMe,
            type: getContentType(message.message),
        };
        conn.send = async (to, text, options = {}) => {
            const sendOptions = options.quoted ? { quoted: options.quoted } : {};
            return conn.sendMessage(to, { text, ...sendOptions });
        };    
        message.reply = async (text, options = {}) => {
            return conn.send(message.user, text, options);  
        };
        message.downloadMedia = async () => {
            if (message.type && ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(message.type)) {
                const stream = await downloadContentFromMessage(
                    message.message[message.type], 
                    message.type.replace('Message', '')
                );
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            }
            throw new Error("Media download not supported for this message type");
        };

        message.text = (() => {
            if (!message.message) return '';   
            switch (message.type) {
                case 'conversation':
                    return message.message.conversation || '';
                case 'extendedTextMessage':
                    return message.message.extendedTextMessage?.text || '';
                case 'imageMessage':
                case 'videoMessage':
                case 'documentMessage':
                case 'audioMessage':
                    return message.message[message.type]?.caption || '';
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

        message.quoted = (() => {
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

        return message;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = { serialize };
