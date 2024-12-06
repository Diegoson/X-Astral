const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'mics',
    desc: 'latency',
    execute: async (message) => {
        const start = Date.now(); 
        const send = await message.reply('Ping..'); 
        const latency = send.createdTimestamp - message.createdTimestamp;
        await send.edit(`Pong! ${latency}ms.`);
    }
});
