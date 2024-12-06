const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason,  
    Browsers, 
    delay 
} = require("@whiskeysockets/baileys");
const { serialize } = require("./lib/messages");
const ut = require("util")
const { getPlugins } = require('./lib/loads');
const CONFIG = require("./config");
const readline = require("readline");
const chalk = require("chalk");
const pino = require("pino");
const { 
    sendWelcome, 
    sendGoodbye, 
    sendPromote, 
    sendDemote 
} = require("./groups");
const { makeInMemoryStore } = require("@whiskeysockets/baileys");
const { commands } = require("./lib/commands"); 

global.SESSION_ID = "session";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));
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
        } else if (CONFIG.logging.level === "error" && level === "error") {
            console.log(chalk.redBright(`[ERROR] ${message}`));
        } else if (CONFIG.logging.level === "debug") {
            console.log(chalk.greenBright(`[DEBUG] ${message}`));
        }
    }

    conn.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "notify" && Array.isArray(messages)) {
            for (const msg of messages) {
                const message = await serialize(conn, msg);
                const { sender, isGroup, text } = message;
                if(!message.fromMe && !CONFIG.app.mods.includes(message.sender.split("@")[0])){
                    return;
                }
                log("info", `[USER]: ${sender}\n [MESSAGE]: ${text || "Media/Other"}\n [CHAT]: ${isGroup ? "GROUP" : "PRIVATE"}`);
                if (text) {
                    const command = commands.find(c => c.command === text.trim().toLowerCase());
                    if (command) {
                        await command.execute(message, conn);
                    }
                    if (text.startsWith('$') || text.startsWith('>')) {
                        try {
                            const result = await eval((async()=>{text.slice(1).trim()})());
                            return message.reply(`${ut.inspect(result, {depth: null})}`);
                        } catch (error) {
                            message.reply(`${error.message}`);
                        }
                    }
                }
            }
        }
    });

    conn.ev.on("creds.update", saveCreds);
    if (!conn.authState.creds.registered) {
        console.clear();
        console.log(chalk.cyan('Starting pairing process...'));
        let phoneNumber = await question(`   ${chalk.cyan('- Please enter your WhatsApp number')}: `);
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        try {
            let code = await conn.requestPairingCode(phoneNumber);
            console.log(chalk.cyan(`Pairing Code: ${code}`));
            console.log(chalk.cyan('Follow the instructions on WhatsApp to complete pairing'));
        } catch (error) {
            console.error(chalk.redBright('Err:'), error);
        }
        rl.close();
    }

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        for (const participant of participants) {
            log("info", `GROUP: ${action} ${participant} => ${id}`);
            if (action === "add") await sendWelcome(conn, id, participant);
            else if (action === "remove") await sendGoodbye(conn, id, participant);
            else if (action === "promote") await sendPromote(conn, id, participant);
            else if (action === "demote") await sendDemote(conn, id, participant);
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log(chalk.greenBright('Connection established successfully!'));
            const plugins = getPlugins(); 
        }
    });
}

startBot();
