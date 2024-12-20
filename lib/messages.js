const { proto, getContentType, downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
const CONFIG = require('../config');

const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
    } else {
        return jid;
    }};

async function serialize(conn, message) {
    try {
        if (!message || !message.key) return null;
        message.id = message.key.id;
        message.isBaileys = message.id.startsWith("BAE5") && message.id.length === 16;
        message.user = message.key.remoteJid;
        message.isFromMe = message.key.fromMe;
        message.isGroup = message.user?.endsWith("@g.us");
        message.sender = decodeJid(
            (message.isFromMe && conn.user.id) ||
            message.participant ||
            message.key.participant ||
            message.user ||
            ""
        );

        if (message.isGroup) {
            message.participant = decodeJid(message.key.participant) || "";}
        if (message.message) {
            const type = getContentType(message.message);
            message.mtype = type;
            let msg = message.message[type];
            message.text =
                type === "buttonsResponseMessage"
                    ? msg.selectedButtonId
                    : type === "listResponseMessage"
                    ? msg.singleSelectReply.selectedRowId
                    : type === "templateButtonReplyMessage"
                    ? msg.selectedId
                    : msg.caption ||
                      msg.text ||
                      message.message.conversation ||
                      msg.contentText ||
                      msg.selectedDisplayText ||
                      msg.title ||
                      "";
                let response =
                type === "conversation" && message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : (type === "imageMessage" || type === "videoMessage") &&
                      message.text &&
                      message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : type === "extendedTextMessage" && message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : type === "buttonsResponseMessage" && message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : type === "listResponseMessage" && message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : type === "templateButtonReplyMessage" && message.text?.startsWith(CONFIG.app.prefix)
                    ? message.text
                    : "";
            if (msg?.contextInfo?.quotedMessage) {
                let quoted = (message.quoted = msg.contextInfo.quotedMessage);
                let quotedType = getContentType(quoted);
                message.quoted = quoted[quotedType];
                if (["productMessage"].includes(quotedType)) {
                    quotedType = getContentType(message.quoted);
                    message.quoted = message.quoted[quotedType];
                   }
                if (typeof message.quoted === "string") {
                    message.quoted = { text: message.quoted };
                }
                message.quoted.mtype = quotedType;
                message.quoted.id = msg.contextInfo.stanzaId;
                message.quoted.user = msg.contextInfo.remoteJid || message.user;
                message.quoted.isBaileys = message.quoted.id
                    ? message.quoted.id.startsWith("BAE5") && message.quoted.id.length === 16
                    : false;
                message.quoted.sender = decodeJid(msg.contextInfo.participant);
                message.quoted.isFromMe = message.quoted.sender === (conn.user && conn.user.id);
                message.quoted.text =
                    message.quoted.text ||
                    message.quoted.caption ||
                    message.quoted.conversation ||
                    message.quoted.contentText ||
                    message.quoted.selectedDisplayText ||
                    message.quoted.title ||
                    "";
                message.quoted.mentionedJid =
                    msg.contextInfo?.mentionedJid || [];
                message.quoted.download = () => conn.downloadMediaMessage(message.quoted);
            }
        }
        if (message.msg?.url) {
            message.download = () => conn.downloadMediaMessage(message.msg);}
        if (message.isGroup) {
            try {
                const metadata = await conn.groupMetadata(message.user);
                message.groupParticipants = metadata.participants.map((p) => p.id);
                message.groupAdmins = metadata.participants
                    .filter((p) => ["admin", "superadmin"].includes(p.admin))
                    .map((admin) => admin.id);
                message.groupSize = metadata.participants.length;
                message.isBotAdmin = message.groupAdmins.includes(conn.user.id);
            } catch {
                message.groupParticipants = [];
                message.groupAdmins = [];
                message.groupSize = 0;
                message.isBotAdmin = false;
            }
        } else {
            message.isBotAdmin = false; }
        conn.send = async (jid, content, options = {}) => {
            return conn.sendMessage(jid, content, options); 
        };
            message.reply = (text, options = {}) =>
            conn.sendMessage(message.user, { text }, { quoted: message, ...options });
        message.forward = (jid, options = {}) =>
            conn.sendMessage(jid, { text: message.text }, { quoted: null, ...options });
        message.mention = (text, users, options = {}) =>
            conn.sendMessage(
                message.user,
                { text, mentions: users },
                { quoted: message, ...options }
            );
        message.react = async (emoji) => {
            if (conn.relayMessage) {
                return conn.relayMessage(message.user, {
                    reactMessage: { key: message.key, text: emoji },
                });
            }};
        return message;
    } catch (error) {
        console.error("err", error);
        return null;
    }
}

module.exports = { serialize };
                
