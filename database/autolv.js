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
    await Levels.appendXp(contact, 'global', 7);
    const user = await Levels.fetch(contact, 'global');
    if (user.levelUp) { 
      const img = await conn.profilePictureUrl(contact, 'image');
      const pushname = (await conn.getContact(userId)).pushname || "astral";
      const category = maxUP(user.level); 
      const max_send = `😝 **Level-Up** 😝\n**Pushname**: ${pushname}\n**🎈 Max Level**: ${user.level}\n**🎈 Category**: ${category}\nBoot up`;
      await conn.sendMessage(contact, { image: { url: img }, caption: max_send });
    }} catch (error) {
    console.error(error);
  }
}

module.exports = {  };
    
