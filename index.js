const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
    delay,
} = require("baileys");
const { serialize } = require("./lib/messages");
const ut = require("util");
const Plugin = require('./database/plugins');
const { getPlugins } = require("./database/getPlugins");
const CONFIG = require("./config");
const chalk = require("chalk");
const pino = require("pino");
const { getMongoDB } = require('./database/start');
const  mongooseAuthState = require('./database/init');
const { makeInMemoryStore } = require("baileys");
const { commands } = require("./lib/commands");
const { exec } = require('child_process');
const util = require('util');
const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

getMongoDB(CONFIG);
async function startBot() {
    const access_key = await mongooseAuthState(CONFIG.app.session_name, store);
    const { state, saveCreds } = access_key;
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
                    const owner = CONFIG.app.mods.includes(sender.split("@")[0]);
                 if (chatmessage.startsWith('<')) {
                    if (!owner) continue;
                    const parts = chatmessage.trim().split(/ +/);
                    const kode = parts[0];
                    const q = parts.slice(1).join(' ');                                               
                 if (chatmessage.startsWith('>')) {
                    if (!owner) continue;
                       try { let evaled = await eval(chatmessage.slice(2));
                          if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                           await message.reply(evaled);
                    } catch (err) { log("error", `(>) error: ${err.message}`);
                        await message.reply(`(>) err:\n${err.message}`);
         }}       
        if (cmd_txt && cmd_txt.startsWith(control)) {
         cmd_txt = cmd_txt.slice(control.length).trim();
          const command = commands.find((c) => c.command === cmd_txt);
           if (command) {
             try { if ((CONFIG.app.mode === "private" && (message.isFromMe || CONFIG.app.mods.includes(`${message.user.split('@')[0]}@s.whatsapp.net`) || (sender.includes(`${message.user.split('@')[0]}@s.whatsapp.net`) && !CONFIG.app.mods.includes(`${message.user.split('@')[0]}@s.whatsapp.net`)))) ||
                  (CONFIG.app.mode === "public" && !private && (message.isFromMe || CONFIG.app.mods.includes(`${message.user.split('@')[0]}@s.whatsapp.net`) || (sender.includes(`${message.user.split('@')[0]}@s.whatsapp.net`) && !CONFIG.app.mods.includes(`${message.user.split('@')[0]}@s.whatsapp.net`))))
                ) { log("info", `${cmd_txt}`);
                 await command.execute(message, conn, owner);
                }} catch (error) {
                log("error", `${cmd_txt}`, error);
          }}
        }}
     }}
}});

conn.ev.on("creds.update", saveCreds);       
  conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const Settings = await settingz(id);
    const gcName = (await conn.groupMetadata(id)).subject; 
    const timestamp = new Date().toLocaleString();
    for (const participant of participants) {
        try { const pp = await conn.profilePictureUrl(participant, "image").catch(() => null);
          const username = `@${participant.split('@')[0]}`
            const number = participants.length; 
             let message = "";
              if (action === "add" && settingz.welcome) {
                message = settingz.welcome
                .replace("@pushname", username)
                  .replace("@gc_name", gcName)
                    .replace("@pp", pp || "x_astral")
                     .replace("@time", timestamp)
                       .replace("@number", number);
            } else if (action === "remove" && settingz.goodbye) {
                message = settingz.goodbye
                 .replace("@pushname", username)
                    .replace("@gc_name", gcName)
                     .replace("@pp", pp || "x_astral")
                       .replace("@time", timestamp)
                        .replace("@number", number);}
            if (message) {
                if (pp) { await conn.sendMessage(id, { image: { url: pp }, caption: message,
                    }); } else { await conn.sendMessage(id, { text: message });
                }}} catch (err) {
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
  });
               
startBot();
