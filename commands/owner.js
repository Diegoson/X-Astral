const { CreatePlug } = require('../lib/commands');
const { CONFIG, Mod } = require('../database/mods');

CreatePlug({
    command: 'mod',
    category: 'owner',
    desc: 'moderators',
    execute: async (message, conn, owner) => {
        const args = message.text.split(' ').slice(1);
        const command = args[0]?.toLowerCase(); 
        const nums = args[1];
         if (command === 'getmods') {
            const mods = await Mod.find({}, { phoneNumber: 1, _id: 0 });
            if (mods.length === 0) {
                return;}
            const sudo = mods.map(mod => mod.phoneNumber).join(', ');
            return message.reply(`${sudo}`);}
            if (command === 'removemod') {
               if (!nums) {
                 return message.reply('_need_num');}
                  const mod = await Mod.findOne({ phoneNumber });
                 if (!mod) {
                    return;}
                    await Mod.findOneAndDelete({ phoneNumber });
                    return message.reply(`removed_sudo: ${phoneNumber}`);
                } if (command === 'addmod') {
                    if (!nums) {
                     return message.reply('need num');}
                      const exists = await Mod.findOne({ phoneNumber });
                    if (exists) {
                      await message.react('❌');
                        return message.reply(`already exist`);}
                        const start = new Mod({ phoneNumber });
                         await start.save();
                          await message.react('🗣️');
                            return message.reply(`added: ${phoneNumber}`);}
                          return message.reply('use: "addmod", "removemod", or "getmods"');
                  },
             });
      
