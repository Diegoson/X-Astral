const { commands, CreatePlug } = require('../lib/commands');
const { monospace } = require('../lib/index');
const CONFIG = require('../config');

CreatePlug({
    command: 'menu',
    category: 'general',
    desc: 'types',
    execute: async (message, conn) => {   
        await message.react('🗣️');
        const gorized = commands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd.command);
            return acc;
        }, {});

        const namo = () => {
            const now = new Date();
            const date = now.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
            const time = now.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
            return `╭──╼【 ${monospace(CONFIG.app.botname.toUpperCase())} 】\n` +
                   `┃ ✦ Prefix  : ${CONFIG.app.prefix}\n` +
                   `┃ ✦ User    : ${message.pushName || 'unknown'}\n` +
                   `┃ ✦ Date    : ${date}\n` +  
                   `┃ ✦ Time    : ${time}\n` +  
                   `┃ ✦ Version : ${CONFIG.app.version}\n` +
                   `╰──────────╼`;
        };
        const pack = (category, cmds) => {
            return `╭───╼【 *${monospace(category.toUpperCase())}* 】\n` +
                   cmds.map(cmd => `┃ ∘ \`\`\`${cmd.toLowerCase()}\`\`\``).join('\n') + '\n' +
                   `╰──────────╼`;
        };

        let msg = namo() + '\n\n'; 
        for (const [category, cmds] of Object.entries(gorized)) {
            msg += pack(category, cmds) + '\n\n';
        }
        msg += `made with 💘`;
        try {
            const recipient = message.user || message.chatId || message.from;
            if (!recipient) throw new Error("ID");
            await conn.send(recipient, { text: msg.trim() }, { quoted: message });
        } catch (error) {
            console.error(error.message);
        }
    }
});

CreatePlug({
    command: 'list',
    category: 'general',
    desc: 'Display list',
    execute: async (message, conn) => {   
     await message.react('🗣️');
       const dontAddCommandList = commands
            .map((cmd, index) => `${index + 1}. ${monospace(cmd.command)} - ${cmd.desc || '_'}`)
            .join('\n');
        await conn.send(message.user, { text: dontAddCommandList }, { quoted: message });
    }
});
                  
