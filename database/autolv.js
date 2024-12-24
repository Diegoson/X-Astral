const Levels = require('discord-xp');
const categories = { 
  naruto: ['Hokage', 'Akastuki Clan', 'Madara Uchiha',
  'Uchiha', 'Akatsuki', 'Shinobi', 'Sannin', 'Rogue Ninja', 'Sasuke', 'Itachi', 'Naruto', 'Kurama 9tl'],
  dragonBall: ['Son Goku', 'Vegita', 'Jiren', 'Blory', 'Gohan', 'Vegito', 'Gogeta', 'Gotenks', 'Namekian', 'Frieza Force', 'Z Fighter', 'Majin', 'Android', 'Beerus', 'Whis', 'Grand Zeno'],};
function cxl(level) { 
  if (level < 5) return categories.naruto[Math.floor(Math.random() * categories.naruto.length)];
  if (level >= 5 && level < 10) return categories.dragonBall[Math.floor(Math.random() * categories.dragonBall.length)];
  return categories.naruto[Math.floor(Math.random() * categories.naruto.length)];
}

async function maxUP(message, conn) {
  try { const contact = message.key.remoteJid;
    const username = contact.split('@')[0] || 'astral'; 
    await Levels.appendXp(contact, 'global', 7);
    const user = await Levels.fetch(contact, 'global');
    if (user.levelUp) { 
      const img = await conn.profilePictureUrl(contact, 'image');
      const category = cxl(user.level); 
      const max_send = `😝 **Level-Up** 😝\n**Username**: ${username}\n**🎈 Max Level**: ${user.level}\n**🎈 Category**: ${category}\nBoot up`;
      await conn.sendMessage(contact, { image: { url: img }, caption: max_send });
    }} catch (error) {
    console.error(error);
  }
}

async function detectACTION(update, conn) {
  const { id, participants, action } = update; 
  try { for (const participant of participants) {
      const zmg = await conn.profilePictureUrl(participant, 'image').catch(() => null);
      const username = participant.split('@')[0]; 
      let _msg = '';
      if (action === 'promote') {
        _msg = `**Promotion Alert!**\n**Name**: ${username}\nWow new role`;
      } else if (action === 'demote') {
        _msg = `**Demotion Alert!** \n**Name**: ${username}\nBeen adjusted`;
      }  if (_msg) {
        if (zmg) {
          await conn.sendMessage(id, {
            image: { url: zmg },
            caption: _msg, 
          });
        } else {
          await conn.sendMessage(id, { text: _msg });
        }}
    }} catch (error) {console.error(error);
  }}

module.exports = { maxUP, detectACTION };
