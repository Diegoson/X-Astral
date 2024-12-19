const { CreatePlug } = require('../lib/commands');
const { CONFIG, Mod } = require('../database/mods');
CreatePlug({
    command: 'mod',
    category: 'owner',
    desc: 'moderators',
    execute: async (message, conn, owner) => {
        if (!owner) return;
        const args = message.text.split(' ').slice(1);
        const command = args[0]?.toLowerCase();
        const phoneNumber = args[1];
        if (command === 'getmods') {
            const mods = await Mod.find({}, { phoneNumber: 1, _id: 0 });
            if (mods.length === 0) return message.reply('Not found');
            const sudo = mods.map(mod => mod.phoneNumber).join(', ');
            return message.reply(`${sudo}`);}
        if (command === 'removemod') {
            if (!phoneNumber) return message.reply('needs phone number');
            const mod = await Mod.findOne({ phoneNumber });
            if (!mod) return message.reply('not found');
            await Mod.findOneAndDelete({ phoneNumber });
            return message.reply(`removed: ${phoneNumber}`);
        } if (command === 'addmod') {
            if (!phoneNumber) return message.reply('provide a phone number');
            const exists = await Mod.findOne({ phoneNumber });
            if (exists) { await message.react('❌'); return message.reply('already exists'); }
            const start = new Mod({ phoneNumber });
            await start.save();
            await message.react('🗣️');
            return message.reply(`Added mod: ${phoneNumber}`);
        } return message.reply('Use: "addmod", "removemod", or "getmods"');
    },
});
                
