const chalk = require('chalk');
const CONFIG = require('../config');
const { serialize } = require('./messages.js');
const { commands, CreatePlug } = require('./commands'); 

const WhatsAppBot = async (messages, message) => {
  if (messages.type !== 'notify') return;
  const cloneDeep = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)));
  const m = serialize(cloneDeep(messages.messages[0]), message);
  const messagez = {
    conversation: (msg) => msg.message.conversation,
    extendedTextMessage: (msg) => msg.message.extendedTextMessage.text,
  };
  const body = messagez[m.mtype] ? messagez[m.mtype](m) : '';
  const args = body.trim().split(/ +/).slice(1);
  const quoted = m.quoted || m;
  const qmsg = quoted.msg || quoted;
  const mime = qmsg.mimetype || '';
  const pushName = m.pushName || '_';

  async function runCommand(input) {
    const [name, ...args] = input.split(' ');
    const command = commands.find(cmd => cmd.command === name);
    if (command) {
      try { await command.execute(message, args, mime, qmsg, quoted, body, pushName);
      } catch (error) {
        }
    } else {
    }
  }

  if (body.startsWith(CONFIG.app.prefix)) {
    runCommand(body.slice(CONFIG.app.prefix.length));
  }
};

module.exports = {
  WhatsAppBot
};
      
