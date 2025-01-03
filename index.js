const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { eval: evaluate } = require("./lib/eval");
const { groups } = require("./database/group");
const { getPlugins } = require("./database/getPlugins");
const { maxUP, detectACTION } = require("./database/autolv");
const { serialize, decodeJid } = require("./lib/messages");
const { commands } = require("./lib/commands");
const CONFIG = require("./config");
const CryptoJS = require('crypto-js');

(async function () {
const prefix = "Naxor~";
const output = "./lib/session/";
async function sessionAuth(id) {
    const filePath = `${output}creds.json`;
    if (!fs.existsSync(filePath)) {
        if (!CONFIG.app.session_name.startsWith(prefix)) {
            console.log("Invalid session ID!");
        }
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
        }
        const randomID = CryptoJS.lib.WordArray.random(30).toString(CryptoJS.enc.Base64).substring(0, 30);
        const _ID = id.replace(prefix, "");
        const creds = {
            id: _ID,
            createdAt: new Date().toISOString(),
            sessionData: `Session for ${randomID}`,
        };
        fs.writeFileSync(filePath, JSON.stringify(creds, null, 2), "utf8");
    }
}

    async function startBot() {
        await CONFIG.app.DATABASE.sync();
        let { state, saveCreds } = await useMultiFileAuthState(output, pino({ level: "silent" }));
        const conn = makeWASocket({
            version: (await fetchLatestBaileysVersion()).version,
            printQRInTerminal: false,
            browser: Browsers.macOS("Chrome"),
            logger: pino({ level: "silent" }),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys),
            },
        });

 conn.ev.on("creds.update", saveCreds);
 conn.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        try {
            const messageObject = messages?.[0];
            if (!messageObject) return;
            const _msg = JSON.parse(JSON.stringify(messageObject));
            const message = await serialize(_msg, conn);

            if (!message.message || message.key.remoteJid === "status@broadcast") return;

            if (
                message.type === "protocolMessage" ||
                message.type === "senderKeyDistributionMessage" ||
                !message.type ||
                message.type === ""
            )
                return;

            await maxUP(message, conn);
            const { sender, isGroup, body } = message;

            if (!body) return;

            const cmd_txt = body.trim().toLowerCase();
            const match = body.trim().split(/ +/).slice(1).join(" ");
            const iscmd = cmd_txt.startsWith(CONFIG.app.prefix.toLowerCase());
            const owner =
                decodeJid(conn.user.id) === sender || CONFIG.app.mods.includes(sender.split("@")[0]);

            console.log(
                "------------------\n" +
                    `user: ${sender}\nchat: ${isGroup ? "group" : "private"}\nmessage: ${cmd_txt}\n` +
                    "------------------"
            );

            if (CONFIG.app.mode === "private" && iscmd && !owner) {
                return;
            }

            if (cmd_txt.startsWith(CONFIG.app.prefix.toLowerCase()) && iscmd) {
                const args = cmd_txt.slice(CONFIG.app.prefix.length).trim().split(" ")[0];
                const command = commands.find((c) => c.command.toLowerCase() === args);
                if (command) {
                    try {
                        if (
                            (CONFIG.app.mode === "private" && owner) ||
                            CONFIG.app.mode === "public"
                        ) {
                            await command.execute(message, conn, match, owner);
                        }
                    } catch (err) {
                        console.error("Command Execution Error:", err.message);
                    }
                }
            }
        } catch (err) {
            console.error("Message Upsert Error:", err.message);
        }
    });

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
    await detectACTION(id);
    var group = await groups(id); 
    participants.forEach(participant => {
        if (action === "add") {
            conn.sendMessage(id, group.welcome.replace('@pushname', participant).replace('@gc_name', id).replace('@number', participant).replace('@time', new Date().toLocaleString()), { quoted: id });
        } else if (action === "remove") {
            conn.sendMessage(id, group.goodbye.replace('@pushname', participant).replace('@gc_name', id).replace('@time', new Date().toLocaleString()), { quoted: id });
        }
    });
});

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("Connection established 👍");
         await getPlugins();
           const mode = CONFIG.app.mode; const mods = CONFIG.app.mods; const mongodb_url = CONFIG.app.mongodb;
             const _msg_ = [
                `*Im Online Now*`,\n`Mode      : ${mode && mode.toLowerCase() === "private" ? "Private" : "Public"}`,\n`Prefix    : ${CONFIG.app.prefix}`,
                `Mongodb   : ${mongodb_url && mongodb_url.trim() ? "✔️ Connected" : "❌ Not Connected"}`,
                `Botname   : ${CONFIG.app.botname}`,
            ].join("\n");

            const recipients = [conn.user.id, ...CONFIG.app.mods];
            for (const recipient of recipients) {
                await conn.sendMessage(recipient, {
                    text: "```" + _msg_ + "```",
                });
            }
        }
    });
}


startBot()
})();
     
