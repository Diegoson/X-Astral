
const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'whois',
    category: 'misc',
    desc: 'fetch user details',
    execute: async (message, conn, match) => {
        if(!match) return;
        const user = match || message.user;
        const { status, setAt } = await conn.fetchStatus(user).catch(() => ({}));
        const _image = await conn.profilePictureUrl(user, "image").catch(() => null);
        const name = user || message.pushName;
        await conn.send(message.user, { image: { url: _image, caption: `@${name}\nStatus: ${status || 'astral'}\nLast Updated: ${setAt ? new Date(setAt).toLocaleString() : 'unknown'}`, mentions: [user]
   
        }
               }
       }
});
                        
