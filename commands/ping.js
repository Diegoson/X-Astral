const { CreatePlug, runCommand } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'Utility',
    desc: 'Check bot status',
    execute: async (m) => {
        await m.reply('Pong!');
    }
});