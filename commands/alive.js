const { CreatePlug } = require('../lib/commands');
const User = require('../database/alive');

CreatePlug({
    command: 'alive',
    category: 'general',
    desc: 'alive',
    execute: async (message, conn) => {
        await message.react('🗣️');
        const _user = await User.findOne({ where: { id: message.user } });
        const msg = user ? _user.generateAliveMessage() : '_not active_';   
        await conn.send(message.user, {
            text: msg,
        });
    }
});
