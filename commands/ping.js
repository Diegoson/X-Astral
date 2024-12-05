const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'Utility',
    desc: 'latency',
    execute: async (message) => {
        const start = Date.now(); 
        const mz = Date.now() - start; 
        const latency = se.createdTimestamp - message.createdTimestamp; 
        await message.reply(`Pong! ${mz}ms`);
    }
});
            
