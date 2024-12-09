const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const groupCache = new Map();

async function serialize(conn, message) {
    try {
      if (!message || !message.key) {
            console.error(chalk.red('Invalid message object'));
            return null;
        }

        const messageType = getContentType(message.message);
        const timestamp = message.messageTimestamp;
        message = {
            ...message,
            id: message.key.id,
            uniqueId: message.key.id,
            user: message.key.remoteJid,
            isGroup: message.key.remoteJid?.endsWith('@g.us'),
            sender: message.key.participant || message.key.remoteJid,
            fromMe: message.key.fromMe,
            now: timestamp,
            type: messageType,
            timestamp,
        };

        if (message.isGroup) {
            const groupId = message.user;
            if (!groupCache.has(groupId)) {
                try {
                    const groupMetadata = await conn.groupMetadata(groupId);
                    groupCache.set(groupId, {
                        data: groupMetadata,
                        fetchedAt: Date.now(), 
                    });
                } catch (error) {
                    message.groupMetadata = null;
                    message.isBotAdmin = false;
                }
            }

            const cachedGroup = groupCache.get(groupId);
            message.groupMetadata = cachedGroup?.data || null;
            message.isBotAdmin = cachedGroup?.data?.participants.some(
                (participant) => participant.id === conn.user.id && participant.admin !== null
            );
        }

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

        console.log(chalk.bold.blue('\n== Message =='));
        console.log(chalk.greenBright(`SENDER: ${message.sender}`));
        console.log(chalk.cyan(`NUM: ${message.sender?.split('@')[0]}`));
        console.log(chalk.yellow(`MESG: ${message.text || chalk.italic('Nope')}`));
        console.log(
            chalk.magentaBright(
                `TYPE: ${message.isGroup ? 'Group Chat' : 'Private'}`
            )
        );
        if (message.isGroup) {
            console.log(chalk.magenta(`GROUP_NAME: ${message.groupMetadata?.subject || 'astral'}`));
        }
        console.log(chalk.bold.blue('======\n'));
        conn.send = async (to, content, options = {}) => {
            try {
                if (typeof content === 'object') {
                    const sendOptions = options.quoted ? { quoted: options.quoted } : {};
                    return conn.sendMessage(to, { ...content, ...sendOptions });
                }
                const sendOptions = options.quoted ? { quoted: options.quoted } : {};
                return conn.sendMessage(to, { text: String(content), ...sendOptions });
            } catch (error) {
                   throw new Error('Error');
            }
        };

        message.reply = async (text, options = {}) => {
            try {
                return conn.send(message.user, String(text), { ...options });
            } catch (error) {
                 throw new Error('Error');
            }
        };
       message.downloadMedia = async () => {
            const supportedMediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'];
            if (message.type && supportedMediaTypes.includes(message.type)) {
                try {
                    const stream = await downloadContentFromMessage(
                        message.message[message.type],
                        message.type.replace('Message', '')
                    );
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    return Buffer.concat(chunks);
                } catch (error) {
                    throw new Error('Error');
                }
            }
            throw new Error('Media type not supported');
        };
        return message;
    } catch (error) {
        return null;
    }
}

module.exports = { serialize };
