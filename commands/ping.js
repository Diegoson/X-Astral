const { CreatePlug } = require('../lib/commands');
const Ping = require('../database/Ping');

CreatePlug({
    command: 'ping',
    category: 'misc',
    desc: 'Check bot latency',
    execute: async (message, conn) => {
        const startTime = Date.now();
        await conn.send(message.user, { text: 'Ping...' });
        const endTime = Date.now();
        new Ping({ start: startTime, end: endTime })
            .save()
            .then(pingData => conn.send(message.user, { text: `Pong!: ${pingData.duration} ms` }))
            .catch(() => conn.send(message.user, { text: `err` }));
    }
});
            
