const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'alive',
    category: 'general',
    desc: 'alive',
    execute: async (message, conn) => {
        const platform = process.platform;
        const runtime = process.version;
        const uptime = process.uptime();
        const usage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const status = `\`\`\`
Bot Status:

Platform: ${platform}
Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s
Memory Usage: ${usage}MB
\`\`\``;
        await conn.send(message.user, { text: status }, {quoted: message});
    }
});
                        
