const { commands, CreatePlug } = require('../lib/commands');
const { monospace } = require('../lib/index');
const CONFIG = require('../config');

CreatePlug({
    command: 'menu',
    category: 'general',
    desc: 'types',
    execute: async (message, conn) => {        
      const gorized = commands.reduce((acc, cmd) => {
          if (!acc[cmd.category]) acc[cmd.category] = [];
          acc[cmd.category].push(cmd.command);
          return acc;
      }, {});

      const namo = () => {
        const now = new Date();
        const date = now.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
        const time = now.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
        return `╭──╼【 ${monospace(CONFIG.app.botname.toUpperCase())} 】\n` +
               `┃ ✦ Prefix  : ${CONFIG.app.prefix}\n` +
               `┃ ✦ User    : ${message.pushName || message.user}\n` +
               `┃ ✦ Date    : ${date}\n` +  
               `┃ ✦ Time    : ${time}\n` +  
               `┃ ✦ Version : ${CONFIG.app.version}\n` +
               `╰──────────╼`;
      };

      const package = (category, cmds) => {
        return `╭───╼【 *${monospace(category.toUpperCase())}* 】\n` +
               cmds.map(cmd => `┃ ∘ ```${cmd.toLowerCase())}````).join('\n') + '\n' +
               `╰──────────╼\nmade with 💘`;
      };

      let msg = namo() + '\n\n'; 
      for (const [category, cmds] of Object.entries(gorized)) {
          msg += package(category, cmds) + '\n\n';
      }
      await conn.send(message.user, msg.trim(), {quoted: message});
    }
});
               
