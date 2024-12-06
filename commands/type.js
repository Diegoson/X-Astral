const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'alive',
    category: 'general',
    desc: 'alive',
    execute: async (message,conn) => {
        const platform = process.platform; 
        const runtime = process.version; 
        const uptime = process.uptime(); 
        const usage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); 
        const negro = `_*Hy ${message.user}, Im alive*_
*_PLATFORM_:* \`${platform}\`
*_RUNTIME_:* \`Node.js ${runtime}\`
*_UPTIME_:* \`${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\`
*_MEMORY_:* \`${usage}MB\`

_ Type \`alive\` again to refresh the status_`;
        await conn.send(message.user, { text: negro }
        );
    }
});
  
