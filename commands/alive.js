const { CreatePlug } = require('../lib/commands');
const User = require('../database/alive'); 

CreatePlug({
    command: 'alive',
    category: 'general',
    desc: 'alive',
    execute: async (message, conn) => {
        await message.react('🗣️');
        var user = await User.findOne({ id: message.user });
        if (!user) { user = await User.create({
        username: message.user,
        id: message.user,});}
       const msg = user.generateAliveMessage();
        await conn.send(message.user, {
            text: msg,
        });
    }
});
