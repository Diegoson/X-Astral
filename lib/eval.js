const util = require("util");

module.exports = {
    eval: async (chatmessage, message) => {
        try { let evaled = await eval(chatmessage.slice(2));
            if (typeof evaled !== "string") evaled = util.inspect(evaled);
            await message.reply(evaled);
        } catch (err) {
            console.error(`(>) error: ${err.message}`);
            await message.reply(`(>) err:\n${err.message}`);
        }
    },
};
      
