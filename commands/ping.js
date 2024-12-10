const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'misc', 
    desc: 'Check bot latency', 
    execute: async (message, conn) => {
        try {
            if (!message || !message.user) {
                throw new Error('Message object or user is undefined.');}
            const start = Date.now(); 
            await conn.send(message.user, { text: '```Ping!```' }); 
            const end = Date.now(); 
            const latency = end - start; 
            await conn.send(message.user, { 
                text: `*Pong!*\n \`\`\`${latency}\`\`\` *ms*`
            });
        } catch (error) {
             await conn.send(message.user || 'default', {
                text: `\n${error.message}`,
            });
        }
    },
});
