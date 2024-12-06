const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'mics',
    desc: 'latency',
    execute: async (message,conn) => {
        const start = new Date().getTime();  
        await conn.send(message.user,'```Ping!```')
        const end = new Date().getTime();   
           await conn.send(message.user,'*Pong!*\n ```' + (end - start) + '``` *ms*');

        
    }
});
