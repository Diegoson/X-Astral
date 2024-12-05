const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'alive',
    category: 'Utility',
    desc: 'alive',
    execute: async (message) => {
        var platform = process.platform; 
        var runtime = process.version; 
        var uptime = process.uptime(); 
        var usage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); 
        var negro = `_*Hy ${message.pushName}, Im alive*_
*_PLATFORM_:* \`${platform}\`
*_RUNTIME_:* \`Node.js ${runtime}\`
*_UPTIME_:* \`${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\`
*_MEMORY_:* \`${usage}MB\`

_ Type \`alive\` again to refresh the status_`;
        await message.send(message.user, { negro },{ quoted: message }
        );
    }
});
  
