const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'mics',
    desc: 'latency',
    execute: async (message,conn) => {
        const start = new Date().getTime();  
        const end = new Date().getTime();   
        const latency = end - start;       
        await conn.send(message.user, `Pong! ${latency}ms.`);
    }
});
