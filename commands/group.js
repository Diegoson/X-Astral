const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'kick',
    category: 'group',
    desc: 'actions_on group',
    execute: async (message, conn) => {
        if (!message.isBotAdmin) return await message.reply('_Not Admin_');
        if (message.text.toLowerCase() === 'kick all') {
            const users = message.groupMetadata.participants.filter(p => !p.admin).map(p => p.id);
            if (users.length === 0) return await message.reply('_No non-admin users to kick_');
            await conn.groupParticipantsUpdate(message.user, users, 'remove');
            return await message.send(
                `_Kicked ${users.length} members_`,
                { mentions: users }
              );
        }

        const user = message.mention[0] || message.quotedMessage?.sender;
        if (!user) return await message.reply('_Please mention a member_');
        const istageted = message.groupMetadata.participants.some((p) => p.id === user && p.admin);
        if (istageted) return await message.reply('_Cannot kick an admin_');
        await conn.groupParticipantsUpdate(message.user, [user], 'remove');
        return await message.send(
            `_Kicked @${user.split('@')[0]}_`,
            { mentions: [user] }
        );
    },
});
              
