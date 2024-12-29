const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");
const { serialize } = require("./lib/messages");
const { eval: evaluate } = require("./lib/eval");
const mongoose = require('mongoose');
const Plugin = require('./database/plugins');
const { settingz } = require('./database/group');
const { getPlugins } = require("./database/getPlugins");
const CONFIG = require("./config");
const chalk = require("chalk");
const { maxUP, detectACTION } = require('./database/autolv');
const pino = require("pino");
const path = require('path');
const fs = require('fs');
const { makeInMemoryStore } = require("@whiskeysockets/baileys");
const { commands } = require("./lib/commands");
const { exec } = require('child_process');
const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

 
 

async function connecto() {
    const credsDir = path.join(__dirname, './lib', '/auth_info_baileys/creds.json');
    const cxl = path.join(__dirname, './lib', '/auth_info_baileys/creds.json');
      try {
        if (!fs.existsSync(credsDir)) {
            fs.mkdirSync(credsDir, { recursive: true });
            console.log(credsDir);
        }
    } catch (err) {
        console.error(err.message);
        return;}
    const fetchit = process.env.SESSION_NAME;
    if (fetchit.length > 30) {
        const remsession = fetchit.startsWith("Naxor~") 
            ? Buffer.from(fetchit.replace("Naxor~", ""), 'base64').toString('utf-8') 
            : Buffer.from(fetchit.slice(10), 'base64').toString('utf-8');
        const content = fetchit.startsWith("Naxor~") 
            ? remsession 
            : await new (require('pastebin-js'))('5f4ilKJVJG-0xbJTXesajw64LgSAAo-L').getPaste(remsession);
        fs.writeFileSync(cxl, content, 'utf8');
        console.log('Credentials saved to:', cxl);
    }
} if (!CONFIG?.app?.mongodb) {
    console.log('_MongoDB URL is missing_');
    return;
} mongoose.connection.on('connected', () => {
    console.log('Done');
});
mongoose.connection.on('error', (err) => {
    console.error(err.message);});
mongoose.connect(CONFIG.app.mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to mongodb 🌍'))
    .catch((error) => {
        console.error(error.message);
    });
async function _approve() {
    const sessionExists = fs.existsSync(path.join(__dirname, './lib', '/auth_info_baileys/creds.json'));
    if (!sessionExists) {
        console.log("Session not found. Setting up...");
        await connecto();
    } 
}
async function startBot() {
    const cre_cxl = path.join(__dirname, './lib', '/auth_info_baileys/creds.json');
    await _approve();
    const { state, saveCreds } = await useMultiFileAuthState(cre_cxl);
    const conn = makeWASocket({
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: pino({ level: "silent" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, store),
        },
    });

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
             await maxUP(message, conn);
            const { sender, isGroup, body } = message;
            if (!body) return;
            const owner = CONFIG.app.mods.includes(sender.split("@")[0]);
            const cmd_txt = body.trim().toLowerCase();
            const match = body.trim().split(/ +/).slice(1).join(" ");
            console.log(
            "------------------\n" +
            `user: ${sender}\nchat: ${isGroup ? "group" : "private"}\nmessage: ${cmd_txt}\n` +
            "------------------"
        );
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
            }} catch (error) {}
    });

conn.ev.on("creds.update", saveCreds);
conn.ev.on("group-participants.update", async ({ update,id, participants, action }) => {
    await detectACTION(update);
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
              console.log('Plugin logged to database');
            } catch (err) {
         }}
           const all_Plugs = await Plugin.find();
           console.log(('Plugins in database:'), all_Plugs);
      }
  })
    };
               
startBot();
