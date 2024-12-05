const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason,  
    Browsers, 
    delay 
} = require("@whiskeysockets/baileys");
const { serialize } = require("./lib/messages");
const { getPlugins } = require('./lib/loads');
const { WhatsAppBot } = require("./lib/index");
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
const pairingCode = process.argv.includes("--pairing-code");
if (!pairingCode) {
    console.log(chalk.redBright("Use --pairing-code to start pairing"));
}

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
        printQRInTerminal: !pairingCode,
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
        if (type === "notify") {
            for (const msg of messages) {
                const m = await serialize(conn, msg);
                const { sender, isGroup } = m; 
                log("info", `[USER]:${sender}\n [MESSAGE]: ${m.text || "Media/Other"}\n [CHAT]: ${isGroup ? "GROUP" : "PRIVATE"}`);
                if (m.text) {
                    const command = commands.find(c => c.command === m.text.trim().toLowerCase());
                    if (command) {
                        await command.execute(m);
                    }
                }
            }
        }
    });

    conn.ev.on("creds.update", saveCreds);
    if (pairingCode && !conn.authState.creds.registered) {
        console.clear();
        console.log(chalk.cyan('Please type your WhatsApp number:'));
        let phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        try {
            let code = await conn.requestPairingCode(phoneNumber);
            console.log(chalk.cyan(`Pairing Code: ${code}`));
        } catch (error) {
            console.error(chalk.redBright('Error generating pairing code:'), error);
        }
        rl.close();
    }

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        for (const participant of participants) {
            log("info", `Group update: ${action} ${participant} in ${id}`);
            if (action === "add") await sendWelcome(conn, id, participant);
            else if (action === "remove") await sendGoodbye(conn, id, participant);
            else if (action === "promote") await sendPromote(conn, id, participant);
            else if (action === "demote") await sendDemote(conn, id, participant);
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            const plugins = getPlugins(); 
        }
    });
}

startBot();
