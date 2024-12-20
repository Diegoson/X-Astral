const { proto, getContentType, jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');

const decodeJid = (jid) => {
    const { user, server } = jidDecode(jid) || {};
    return user && server ? `${user}@${server}`.trim() : jid;
};

const downloadMedia = async (message) => {
    let type = Object.keys(message)[0];
    let msg = message[type];
    if (type === 'buttonsMessage' || type === 'viewOnceMessageV2') {
        if (type === 'viewOnceMessageV2') {
            msg = message.viewOnceMessageV2?.message;
            type = Object.keys(msg || {})[0];
        } else type = Object.keys(msg || {})[1];
        msg = msg[type];}
    const stream = await downloadContentFromMessage(msg, type.replace('Message', ''));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

function serialize(msg, conn) {
    if (msg.key) {
        msg.id = msg.key.id;
        msg.isFromMe = msg.key.fromMe;
        msg.user = decodeJid(msg.key.remoteJid);
        msg.isGroup = msg.user.endsWith('@g.us');
        msg.sender = msg.isGroup ? decodeJid(msg.key.participant) : msg.isFromMe ? decodeJid(conn.user.id) : msg.user;
    }
    if (msg.message) {
        msg.type = getContentType(msg.message);
        if (msg.type === 'ephemeralMessage') {
            msg.message = msg.message[msg.type].message;
            const typeKey = Object.keys(msg.message)[0];
            msg.type = typeKey;
            if (typeKey === 'viewOnceMessageV2') {
                msg.message = msg.message[msg.type].message;
                msg.type = getContentType(msg.message);
            }
        }
        if (msg.type === 'viewOnceMessageV2') {
            msg.message = msg.message[msg.type].message;
            msg.type = getContentType(msg.message);
        }
        msg.messageTypes = (type) => ['videoMessage', 'imageMessage'].includes(type);
        try {
            const quoted = msg.message[msg.type]?.contextInfo;
            if (quoted?.quotedMessage?.ephemeralMessage) {
                const typeKey = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
                if (typeKey === 'viewOnceMessageV2') {
                    msg.quoted = {
                        type: 'view_once',
                        stanzaId: quoted.stanzaId,
                        participant: decodeJid(quoted.participant),
                        message: quoted.quotedMessage.ephemeralMessage.message.viewOnceMessage.message
                    };
                } else {
                    msg.quoted = {
                        type: 'ephemeral',
                        stanzaId: quoted.stanzaId,
                        participant: decodeJid(quoted.participant),
                        message: quoted.quotedMessage.ephemeralMessage.message
                    };
                }
            } else if (quoted?.quotedMessage?.viewOnceMessageV2) {
                msg.quoted = {
                    type: 'view_once',
                    stanzaId: quoted.stanzaId,
                    participant: decodeJid(quoted.participant),
                    message: quoted.quotedMessage.viewOnceMessage.message
                };
            } else {
                msg.quoted = {
                    type: 'normal',
                    stanzaId: quoted.stanzaId,
                    participant: decodeJid(quoted.participant),
                    message: quoted.quotedMessage
                };
            }
            msg.quoted.isFromMe = msg.quoted.participant === decodeJid(conn.user.id);
            msg.quoted.mtype = Object.keys(msg.quoted.message).filter(
                (v) => v.includes('Message') || v.includes('conversation')
            )[0];
            msg.quoted.text =
                msg.quoted.message[msg.quoted.mtype]?.text ||
                msg.quoted.message[msg.quoted.mtype]?.description ||
                msg.quoted.message[msg.quoted.mtype]?.caption ||
                msg.quoted.message[msg.quoted.mtype]?.hydratedTemplate?.hydratedContentText ||
                msg.quoted.message[msg.quoted.mtype] ||
                '';
            msg.quoted.key = {
                id: msg.quoted.stanzaId,
                fromMe: msg.quoted.isFromMe,
                remoteJid: msg.user
            };
            msg.quoted.download = () => downloadMedia(msg.quoted.message);
        } catch {
            msg.quoted = null;
        }
        msg.body =
            msg.message?.conversation ||
            msg.message?.[msg.type]?.text ||
            msg.message?.[msg.type]?.caption ||
            (msg.type === 'listResponseMessage' && msg.message?.[msg.type]?.singleSelectReply?.selectedRowId) ||
            (msg.type === 'buttonsResponseMessage' && msg.message?.[msg.type]?.selectedButtonId) ||
            (msg.type === 'templateButtonReplyMessage' && msg.message?.[msg.type]?.selectedId) ||
            '';
        conn.send = async (jid, content, options = {}) => {
            return conn.sendMessage(jid, content, options);
        };
        msg.reply = (text, options = {}) =>
            conn.sendMessage(msg.user, { text }, { quoted: msg, ...options });
        msg.forward = (jid, options = {}) =>
            conn.sendMessage(jid, { text: msg.text }, { quoted: null, ...options });
        msg.mentions = [];
        if (msg.quoted?.participant) msg.mentions.push(msg.quoted.participant);
        const array = msg?.message?.[msg.type]?.contextInfo?.mentionedJid || [];
        msg.mentions.push(...array.filter(Boolean));
        msg.download = () => downloadMedia(msg.message);
        msg.numbers = msg.body
    ? msg.body.split(/\D+/).filter((num) => num.trim() !== '')
    : [];
   }
    return msg;
}

module.exports = { serialize };
    
