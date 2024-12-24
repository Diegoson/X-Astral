const util = require("util");

async function evaluate(match, message) {
    try {
        let evaled = await eval(match.slice(2));
        if (typeof evaled !== "string") evaled = util.inspect(evaled);
        await message.reply(evaled);
        return message;  
    } catch (err) {
        console.error(`(>) error: ${err.message}`);
        await message.reply(`(>) err:\n${err.message}`);  
        return null;  
    }
}

module.exports = {
    eval: evaluate,
};
