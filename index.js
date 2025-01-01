const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers,
} = require("@whiskeysockets/baileys");
const mongoose = require("mongoose");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { eval: evaluate } = require("./lib/eval");
const Plugin = require("./database/plugins");
const { settingz } = require("./database/group");
const { getPlugins } = require("./database/getPlugins");
const { maxUP, detectACTION } = require("./database/autolv");
const { serialize, decodeJid } = require("./lib/messages");
const { commands } = require("./lib/commands");
const CONFIG = require("./config");

const ENCRYPTION_KEY = crypto.randomBytes(32); // Securely manage this key
const IV = crypto.randomBytes(16);
const SESSION_DIR = "./lib/session/";

async function encryptSession(filePath) {
    if (!fs.existsSync(filePath)) throw new Error("File does not exist");
    const content = fs.readFileSync(filePath, "utf8");
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(content, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `Naxor~${encrypted}`;
}

async function decryptSession(encryptedData, outputPath) {
    if (!encryptedData.startsWith("Naxor~")) throw new Error('Session data must start with "Naxor~"');
    const data = encryptedData.replace("Naxor~", "");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(path.join(outputPath, "creds.json"), decrypted);
}

async function startBot() {
    if (!CONFIG?.app?.mongodb) {
        console.error("MongoDB URL is missing");
        return;
    }

    mongoose.connection.on("connected", () => console.log("Connected to MongoDB 🌍"));
    mongoose.connection.on("error", (err) => console.error("MongoDB Error:", err.message));
    try {
        await mongoose.connect(CONFIG.app.mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR, pino({ level: "silent" }));
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

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        await detectACTION(id);
        const Settings = await settingz(id);
        const gcName = (await conn.groupMetadata(id)).subject;
        const timestamp = new Date().toLocaleString();

        for (const participant of participants) {
            try {
                const pp = await conn.profilePictureUrl(participant, "image").catch(() => null);
                const username = `@${participant.split("@")[0]}`;
                const number = participants.length;
                let message = "";

                if (action === "add" && Settings.welcome) {
                    message = Settings.welcome
                        .replace("@pushname", username)
                        .replace("@gc_name", gcName)
                        .replace("@pp", pp || "x_astral")
                        .replace("@time", timestamp)
                        .replace("@number", number);
                } else if (action === "remove" && Settings.goodbye) {
                    message = Settings.goodbye
                        .replace("@pushname", username)
                        .replace("@gc_name", gcName)
                        .replace("@pp", pp || "x_astral")
                        .replace("@time", timestamp)
                        .replace("@number", number);
                }

                if (message) {
                    if (pp) {
                        await conn.sendMessage(id, { image: { url: pp }, caption: message });
                    } else {
                        await conn.sendMessage(id, { text: message });
                    }
                }
            } catch (err) {
                console.error("Group Participants Update Error:", err.message);
            }
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("Connection established 👍");
            const plugins = getPlugins();
            for (const plugin of plugins) {
                try {
                    await Plugin.findOneAndUpdate(
                        { name: plugin.name },
                        { status: "loaded", error: null },
                        { upsert: true, new: true }
                    );
                    console.log("Plugin logged to database");
                } catch (err) {
                    console.error("Plugin Logging Error:", err.message);
                }
            }

            const all_Plugs = await Plugin.find();
            console.log("Plugins in database:", all_Plugs);
            const mode = CONFIG.app.mode;
            const mods = CONFIG.app.mods;
            const prefix = CONFIG.app.prefix;
            const mongodb_url = CONFIG.app.mongodb;
            const bot = CONFIG.botname;

            const _msg_ = [
                `*Im Online Now*`,
                `Mode      : ${mode && mode.toLowerCase() === "private" ? "Private" : "Public"}`,
                `Prefix    : ${prefix}`,
                `Mongodb   : ${mongodb_url && mongodb_url.trim() ? "✔️ Connected" : "❌ Not Connected"}`,
                `Botname   : ${bot}`,
            ].join("\n");

            const recipients = [conn.user.id, ...mods];
            for (const recipient of recipients) {
                await conn.sendMessage(recipient, {
                    text: "```" + _msg_ + "```",
                });
            }
        }
    });
}


startBot();
     
