const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");
const { serialize } = require("./lib/messages");
const ut = require("util");
const { getMessage } = require('./cn_data/group');
const { getPlugins } = require("./lib/loads");
const CONFIG = require("./config");
const readline = require("readline");
const chalk = require("chalk");
const pino = require("pino");
const  mongooseAuthState = require('./database/init');
const { makeInMemoryStore } = require("@whiskeysockets/baileys");
const { commands } = require("./lib/commands");
const { exec } = require('child_process');
const util = require('util');
const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const conn = makeWASocket({
        auth: state,
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: pino({ level: "silent" }),
    });

    function log(level, message) {
        if (CONFIG.logging.level === "info" && level === "info") {
            console.log(chalk.blueBright(`[INFO] ${message}`));
        }
    }
 
conn.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify" && Array.isArray(messages)) {
        for (const msg of messages) {
            try {
                const message = await serialize(conn, msg);
                if (!message) {
                    continue;}
                const { sender, isGroup, text: chatmessage } = message;
                log("info", `[USER]: ${sender}\n[CHAT]: ${isGroup ? "GROUP" : "PRIVATE"}\n[MESSAGE]: ${chatmessage || "Media/Other"}`);
                const isPrivate = CONFIG.app.mode === "public";
                const isOwner = CONFIG.app.mods.includes(sender.split("@")[0]);
                if (chatmessage.startsWith('<')) {
                    if (!isOwner) continue;
                    const parts = chatmessage.trim().split(/ +/);
                    const kode = parts[0];
                    const q = parts.slice(1).join(' ');
                    if (!q) {
                        log("info", "requires parameters");
                        await message.reply('marete san');
                        continue;
                    } try {
                        const teks = await eval(`(async () => { ${kode === ">>" ? "return" : ""} ${q}})()`);
                        await message.reply(util.format(teks));
                    } catch (e) {
                        log("error", `${e.message}`);
                        await message.reply(`err:\n${e.message}`);
                    }
                }
                  if (chatmessage.startsWith('=>')) {
                    if (!isOwner) continue;
                    try {
                        const result = await eval(`(async () => { ${chatmessage.slice(3)} })()`);
                        await message.reply(util.format(result));
                    } catch (e) {
                        log("error", `Eval (=>) error: ${e.message}`);
                        await message.reply(`err:\n${e.message}`);
                    }
                }
                 if (chatmessage.startsWith('>')) {
                    if (!isOwner) continue;
                    try {
                        let evaled = await eval(chatmessage.slice(2));
                        if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                        await message.reply(evaled);
                    } catch (err) {
                        log("error", `(>) error: ${err.message}`);
                        await message.reply(`(>) err:\n${err.message}`);
                    }
                }
                if (chatmessage.startsWith('$')) {
                    if (!isOwner) continue;
                    exec(chatmessage.slice(2), (err, stdout) => {
                        if (err) {
                            log("error", `${err.message}`);
                            message.reply(`\n${err.message}`);
                            return;
                        } if (stdout) {
                            message.reply(stdout);
                        }
                    });
                }
                const control = CONFIG.app.prefix;
                let cmd_txt = chatmessage ? chatmessage.trim().toLowerCase() : null;
                if (cmd_txt && cmd_txt.startsWith(control)) {
                    cmd_txt = cmd_txt.slice(control.length).trim(); }
                const command = commands.find((c) => c.command === cmd_txt);
                if (command) {
                    try {
                        log("info", `${cmd_txt}`);
                        await command.execute(message, conn);
                    } catch (error) {
                      }
                }

            } catch (error) {
              }
        }
    }
});

    conn.ev.on("creds.update", saveCreds);
    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        for (const participant of participants) {
            const username = `@${participant.split('@')[0]}`;
            const timestamp = new Date().toLocaleString();
            try {
                const message_admin = getMessage(action, username, timestamp);
                if (message_admin) {
                    await conn.sendMessage(id, { text: message_admin, mentions: [participant] });
                }} catch (error) {
                log("error", `${error.message}`);
            }
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log(chalk.greenBright('Connection established successfully'));
            const plugins = getPlugins();
        }
    });
}

startBot();
