const { CreatePlug, runCommand } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'Utility',
    desc: 'Check bot status',
    execute: async (message) => {
        await message.reply('Pong!');
    }
});
