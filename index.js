const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
    delay,
} = require("baileys");
const { mongoDBAuthState } = require('./database/mongoose/session');
const { serialize } = require("./lib/messages");
const { eval: EvalCode } = require("./lib/eval");
const Plugin = require('./database/plugins');
const { getPlugins } = require("./database/getPlugins");
const CONFIG = require("./config");
const chalk = require("chalk");
const pino = require("pino");
const { getMongoDB } = require('./database/start');
const { makeInMemoryStore } = require("baileys");
const { commands } = require("./lib/commands");
const { exec } = require('child_process');
const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

getMongoDB(CONFIG);
async function startBot() {
    const db_session = await mongoDBAuthState(CONFIG.app.session_name, getSession);
    if (db_session) {
    const { state } = db_session;
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
    if (type !== "notify") return;
        try { const messageObject = messages?.[0];
            if (!messageObject) return;
            const _msg = JSON.parse(JSON.stringify(messageObject));
            const message = await serialize(_msg, conn);
            if (!message.message || message.key.remoteJid === "status@broadcast") return;
            if ( message.type === "protocolMessage" ||
                message.type === "senderKeyDistributionMessage" ||
                !message.type ||
                message.type === ""
            ) return;
            const { sender, isGroup, body } = message;
            if (!body) return;
            const owner = CONFIG.app.mods.includes(sender.split("@")[0]);
            const cmd_txt = body.trim().toLowerCase();
            const match = body.trim().split(/ +/).slice(1).join(" ");
            log("info", `[USER]: ${sender}\n[CHAT]: ${isGroup ? "GROUP" : "PRIVATE"}\n[MESSAGE]: ${cmd_txt}`);
            if (cmd_txt.startsWith(CONFIG.app.prefix.toLowerCase())) {
                const args = cmd_txt.slice(CONFIG.app.prefix.length).trim().split(" ")[0];
                const command = commands.find((c) => c.command.toLowerCase() === args);
                if (command) {
                    try {
                        if ((CONFIG.app.mode === "private" &&
                                (message.isFromMe ||
                                    CONFIG.app.mods.includes(sender.split("@")[0]) ||
                                    sender.includes(message.user.split("@")[0]))) ||
                            (CONFIG.app.mode === "public" &&
                                !isGroup &&
                                (message.isFromMe ||
                                    CONFIG.app.mods.includes(sender.split("@")[0]) ||
                                    sender.includes(message.user.split("@")[0])))
                        ) {
                            await command.execute(message, conn, match, owner);
                        }
                    } catch (error) {}
                } else {}
            }} catch (error) {
            log("error", `${error.message}`);
        }
    });

conn.ev.on("creds.update", state);       
conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const Settings = await settingz(id); const gcName = (await conn.groupMetadata(id)).subject; const timestamp = new Date().toLocaleString(); 
    for (const participant of participants) { 
        try { const pp = await conn.profilePictureUrl(participant, "image").catch(() => null); 
            const username = `@${participant.split('@')[0]}`; const number = participants.length; let message = ""; 
            if (action === "add" && Settings.welcome) { 
                message = Settings.welcome.replace("@pushname", username).replace("@gc_name", gcName).replace("@pp", pp || "x_astral").replace("@time", timestamp).replace("@number", number); 
            } else if (action === "remove" && Settings.goodbye) { 
                message = Settings.goodbye.replace("@pushname", username).replace("@gc_name", gcName).replace("@pp", pp || "x_astral").replace("@time", timestamp).replace("@number", number); 
            } if (message) { 
                if (pp) { 
                    await conn.sendMessage(id, { image: { url: pp }, caption: message }); 
                } else { 
                    await conn.sendMessage(id, { text: message }); 
                } 
            }} catch (err) { 
            console.error(`${err.message}`); 
        }} 
});

conn.ev.on("connection.update", async (update) => {
  const { connection } = update;
    if (connection === "open") {
        console.log('Connection established 👍');
       const plugins = getPlugins();
        for (const plugin of plugins) {
            try { await Plugin.findOneAndUpdate(
          { name: plugin.name },
            { status: 'loaded', error: null },{ upsert: true, new: true });
              console.log(('Plugin logged to database');
            } catch (err) {
         }}
           const all_Plugs = await Plugin.find();
           console.log('Plugins in database:'), all_Plugs);
      }
  }
    });
               
startBot();
