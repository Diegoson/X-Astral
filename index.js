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
const { getPlugins } = require('./lib/loads');
const CONFIG = require("./config");
const readline = require("readline");
const chalk = require("chalk");
const pino = require("pino");
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
                const isPrivate = CONFIG.app.mode === "public"; 
                if (!isPrivate && !message.fromMe && !CONFIG.app.mods.includes(sender.split("@")[0])) {
                    return; 
                }
                 const control = CONFIG.app.prefix;
                 let cmd_txt = text ? text.trim().toLowerCase() : null;
                  if (cmd_txt && cmd_txt.startsWith(control)) {
                    cmd_txt = cmd_txt.slice(control.length).trim();
                }
                  const command = commands.find(c => c.command === cmd_txt);
                if (command) {
                    await command.execute(message, conn);
                } else if (cmd_txt?.startsWith('$') || cmd_txt?.startsWith('>')) {
                    try {
                        const result = await eval(cmd_txt.slice(1).trim());
                        return message.reply(`${ut.inspect(result, { depth: null })}`);
                    } catch (error) {
                        message.reply(`${error.message}`);
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
            console.log(chalk.cyan(`Pair_Code=>: ${code}`));
            console.log(chalk.cyan('Follow the instructions on WhatsApp to complete pairing'));
        } catch (error) {
            console.error(chalk.redBright('Err:'), error);
        }
        rl.close();
    }

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        for (const participant of participants) {
            log("info", `GROUP: ${action} ${participant} => ${id}`);
            const username = `@${participant.split('@')[0]}`;
            const timestamp = new Date().toLocaleString(); 
            try {
                if (action === "add") {
              const ww_nxt = `
╭─────【 *welcome* 】
│ *Welcome*, ${username}
│ *Joined at*: ${timestamp}
│ *Enjoy your stay*
╰─────∘
`;                    await conn.sendMessage(id, { text: ww_nxt, mentions: [participant] });
                } else if (action === "remove") {
                    const nxt_xxx = `
╭─────【 *goodbye* 】
│ *Goodbye*, ${username}
│ *Left at*: ${timestamp}
│ *We will miss you*
╰─────∘
`;          await conn.sendMessage(id, { text: nxt_xxx, mentions: [participant]});
                } else if (action === "promote") {
                    const naxor_ser = `
╭─────【 *promoted* 】
│ *Congratulations*, ${username}
│ *Promoted to*: Admin 
│ *Cool great_work*
╰─────∘
`;                   await conn.sendMessage(id, { text: naxor_ser, mentions: [participant] });
                } else if (action === "demote") {
                    const extinct = `
╭─────【 *demoted* 】
│ *Notice*, ${username}
│ *Demoted from*: Admin
│ *Eish wasted_man*
╰─────∘
`;            await conn.sendMessage(id, { text: extinct, mentions: [participant] });
                }
            } catch (error) {
                log("error", `${error.message}`);
            }
        }
    });

    conn.ev.on("connection.update", (() => {
    let send_is_done = false; 
    return async (update) => {
        const { connection } = update;
        if (connection === "open" && !send_is_done) {
            console.log(chalk.greenBright('_Bot is now connected_'));
            const name = CONFIG.app.botname;
            const prefa = CONFIG.app.prefix;
            const modi = CONFIG.app.mode;
            const dune = `
╭─────【 *CONNECTED* 】
│ *Hello! Im online*
│ *Bot Name*: ${name}
│ *Prefix*: ${prefa}
│ *Mode*: ${modi}
│ *Danko_🍀*
╰─────∘
`;  try {
      await conn.sendMessage(conn.user.id, { text: dun });
              send_is_done = true; 
            } catch (error) {}
            const plugins = getPlugins(); 
        }
    };
}));


startBot();
        
