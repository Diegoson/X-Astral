const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'kick',
    category: 'group',
    desc: 'Remove a user from the group',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('Um not admin');
        const participants = await message.groupParticipants;
        const members = message.mentions;
        if (message.text === 'all') {
            const nonAdmins = participants.filter(participant => !participant.admin || participant.admin !== 'admin').map(participant => participant.id);
            if (nonAdmins.length === 0) return message.reply('_remove_');
            await message.reply('_Kicking all non-admins.._');
            for (const user of nonAdmins) {
                await conn.groupParticipantsUpdate(message.user, [user], 'remove')
                    .then(() => message.reply(`Removed: ${user}`))
                    .catch(err => message.reply(`${user}`));
            }
        } else if (members.length > 0) {
            for (const user of members) {
                await conn.groupParticipantsUpdate(message.user, [user], 'remove')
                    .then(() => message.reply(`removed: ${user}.`))
                    .catch(err => message.reply(`${user}.`));
            }
        } else {
            return message.reply('mention_user(s)/type_"all"');
        }
    }
});
                        
CreatePlug({
    command: 'mute',
    category: 'group',
    desc: 'grouo',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('um not admin');
         if (!message.groupAdmins.includes(message.sender)) {
            return;
        }try {
            const currentSettings = await conn.groupMetadata(message.user);
            if (currentSettings.announce) {
                return message.reply('_Group already muted_');}
             await conn.groupSettingUpdate(message.user, 'announcement');
            return message.reply('_group_muted_');
        } catch (err) {
            console.error(err);
            return;
        }
    }
});

CreatePlug({
    command: 'unmute',
    category: 'group',
    desc: 'Unmute',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('um_not_admin');
        if (!message.groupAdmins.includes(message.sender)) {
            return;
        }try {
          const settings = await conn.groupMetadata(message.user);
            if (!settings.announce) {
                return message.reply('group_already_unmuted');}
             await conn.groupSettingUpdate(message.user, 'chat');
            return message.reply('_group_been_unmuted_');
        } catch (err) {
            console.error(err);
            return;
        }
    }
});
                                                   
CreatePlug({
    command: 'tagall',
    category: 'group',
    desc: 'Mention all',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return;
        if (!message.groupAdmins.includes(message.sender)) {
            return;
        }try {
           const groupMetadata = await conn.groupMetadata(message.user);
            const participants = groupMetadata.participants;
            const mentions = participants.map(participant => participant.id);
            const msg = `@${mentions.join(' @')}`;
            await conn.send(message.user, { text: msg, mentions }, { quoted: message });
            return;
        } catch (err) {
            console.error(err);
            return;
        }
    }
});


CreatePlug({
    command: 'ban',
    category: 'group',
    desc: 'Ban a user from the group',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('not admin');
        if (!message.groupAdmins.includes(message.sender)) {
            return;
        }
        const men = message.mentions[0];
        if (!men) return message.reply('mention_user');
        await conn.groupParticipantsUpdate(message.user, [men], 'remove');
        return message.reply(`Banned ${men}`);
    }
});


CreatePlug({
    command: 'promote',
    category: 'group',
    desc: 'Promote a user to admin',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return;
        if (!message.groupAdmins.includes(message.sender)) {
            return;}
        const users = message.mentions[0];
        if (!users) return message.reply('mention a usr');
        await conn.groupParticipantsUpdate(message.user, [users], 'promote');
        return;
    }
});
                        

CreatePlug({
    command: 'demote',
    category: 'group',
    desc: 'Demote a user from admin',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('not admin');
        if (!message.groupAdmins.includes(message.sender)) {
            return;}
        const users = message.mentions[0];
        if (!users) return message.reply('mention a user');
        await conn.groupParticipantsUpdate(message.user, [users], 'demote');
        return;
    }
});

    CreatePlug({
    command: 'info',
    category: 'group',
    desc: 'Get information about the group',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const name = groupMetadata.subject;
        const Desc = groupMetadata.desc;
        const count = groupMetadata.participants.length;
        return message.reply(```*Name*: ${name}\n*Desc*: ${Desc}\n*Members*: ${count}```);
    }
});
            

CreatePlug({
    command: 'promoteall',
    category: 'group',
    desc: 'Promote all members to admins',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('not admin');
        if (!message.groupAdmins.includes(message.sender)) {
            return;
        }
        const groupMetadata = await conn.groupMetadata(message.user);
        const participants = groupMetadata.participants.filter(participant => !participant.admin);
        if (participants.length === 0) return message.reply('non-admin');
        const ToPromote = participants.map(participant => participant.id);
        await conn.groupParticipantsUpdate(message.user, ToPromote, 'promote');
        return message.reply('All_members have been promoted');
    }
});

CreatePlug({
    command: 'demoteall',
    category: 'group',
    desc: 'Demote all admins',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('not admin');
        if (!message.groupAdmins.includes(message.sender)) {
            return;
        }
        const groupMetadata = await conn.groupMetadata(message.user);
        const admins = groupMetadata.participants.filter(participant => participant.admin);
        if (admins.length === 0) return message.reply('No admins to demote');
        const ToDemote = admins.map(admin => admin.id);
        await conn.groupParticipantsUpdate(message.user, ToDemote, 'demote');
        return message.reply('All_admins_been_demoted');
    }
});
            
          
