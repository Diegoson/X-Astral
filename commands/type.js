const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'alive',
    category: 'general',
    desc: 'alive',
    execute: async (message, conn) => {
        try {
            const platform = process.platform;
            const runtime = process.version;
            const uptime = process.uptime();
            const usage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
     const status = `╭───╼〔*Bot Status*〕
            
🟢 *Bot is Alive*
          
🟢 *PLATFORM:* \`${platform}\`                      
🟢 *UPTIME:* \`${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\`     
🟢 *MEMORY:* \`${usage}MB\`

╰──────────╼`;
            const ima = 'https://f.uguu.se/BuFAPRQO.jpg';
            await conn.send(message.user, {
                image: { url: ima },
                caption: status,
            });
        } catch (error) {
            console.error(error);
        }
    }
});
        
