const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function serialize(conn, message) {
    try {
        if (!message || !message.key) {
            console.error('messageType error');
            return null;
        }

        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const groupMetadata = isGroup ? await conn.groupMetadata(message.key.remoteJid) : null;
        const isAdmin = isGroup ? groupMetadata?.participants?.some(participant => participant.id === message.sender && participant.admin) : false;
        const isBotAdmin = isGroup ? groupMetadata?.participants?.some(participant => participant.id === conn.user.jid && participant.admin) : false;
        const groupName = isGroup ? groupMetadata?.subject : null;
        const profilePicUrl = isGroup ? await conn.profilePictureUrl(message.sender) : await conn.profilePictureUrl(message.key.remoteJid);
        const isBroadcast = message.key.remoteJid.endsWith('@broadcast');
        const messageType = getContentType(message.message);
        const timestamp = message.messageTimestamp;
        const isForwarded = message.message?.forwardingScore ? true : false;
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(messageType);
        const isReply = Boolean(message.message?.extendedTextMessage?.contextInfo?.quotedMessage);
        const message_cn = messageType === 'conversation' || messageType === 'extendedTextMessage' ? (message.text ? message.text.length : 0) : 0;
        const isLink = /https?:\/\/[^\s]+/g.test(message.text || '');
        const hasLocation = messageType === 'locationMessage';
        const quotedMessage = (() => {
            const contextInfo = message.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo?.quotedMessage) return null; 
            const quotedType = getContentType(contextInfo.quotedMessage);
            return {
                text: contextInfo.quotedMessage[quotedType] || '', 
                sender: contextInfo.participant || '', 
                messageId: contextInfo.stanzaId || '', 
                type: quotedType 
            };
        })();
       message = {
            ...message,
            id: message.key.id,
            uniqueId: message.key.id,
            user: message.key.remoteJid,
            isGroup: isGroup,
            sender: message.key.participant || message.key.remoteJid,
            fromMe: message.key.fromMe,
            now: message.messageTimestamp,
            type: messageType,
            groupMetadata: groupMetadata,
            groupName: groupName,
            isAdmin: isAdmin,
            isBotAdmin: isBotAdmin,
            profilePicUrl: profilePicUrl,
            isBroadcast: isBroadcast,
            timestamp: timestamp,
            isForwarded: isForwarded,
            isMedia: isMedia,
            isReply: isReply,
            message_cn: message_cn,
            isLink: isLink,
            hasLocation: hasLocation,
            quotedMessage: quotedMessage, 
        };

        conn.send = async (to, content, options = {}) => {
             if (typeof content === 'object') {
                const sendOptions = options.quoted ? { quoted: options.quoted } : {};
                return conn.sendMessage(to, { ...content, ...sendOptions });
            }
            
            content = String(content); 
            const sendOptions = options.quoted ? { quoted: options.quoted } : {};
            return conn.sendMessage(to, { text: content, ...sendOptions });
        };

        message.reply = async (text, options = {}) => {
            text = String(text);  
            return conn.send(message.user, text, { ...options });
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
            throw new Error("Media not supported for this message type");
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

        return message;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = { serialize };
