const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'promote',
    category: 'group',
    desc: 'Promote users to admin',
    execute: async (message, conn, match) => {
        if (!message.isGroup) return; if (!message.isBotAdmin) return message.reply('$I am not an admin_');
        if (!message.groupAdmins.includes(message.sender)) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const cxl = message.mentions; if (!cxl || cxl.length === 0) return message.reply('_Please tag member_');
        for (const username of cxl) {
            const participant = groupMetadata.participants.find(p => p.id === username);
            if (!participant) { message.reply(`@${username.split('@')[0]} not_in group`, null, { mentions: [username] }); continue; }
            if (participant.admin) { message.reply(`@${username.split('@')[0]} already an admin`, null, { mentions: [username] }); continue; }
            await conn.groupParticipantsUpdate(message.user, [username], 'promote')
                .then(() => message.reply(`@${username.split('@')[0]} promoted`, null, { mentions: [username] }))
                .catch(err => message.reply(`${err}`, null, { mentions: [username] }));
        }
    }
});


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
            const settings = await conn.groupMetadata(message.user);
            if (settings.announce) {
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
             await conn.groupSettingUpdate(message.user, 'not_announcement');
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
    desc: 'Mention all with tags',
    execute: async (message,conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return;
        if (!message.groupAdmins.includes(message.sender)) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const participants = groupMetadata.participants;
        const mentions = participants.map((participant, index) => ({
            id: participant.id,
            tag: `${index + 1} @${participant.id.split('@')[0]}`}));
        const _mgs = message.body.slice(message.body.indexOf(' ') + 1).trim();
        const msg = `${_mgs}\n\n${mentions.map(m => m.tag).join('\n')}`;
        await conn.send(
            message.user,
            { text: msg, mentions: mentions.map(m => m.id) },
            { quoted: message }
        );
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
        const desc = groupMetadata.desc;
        const count = groupMetadata.participants.length;
        const img = await conn.profilePictureUrl(message.user);
        await conn.send(message.user, {
            image: { url: img }, 
            caption: `*Name*: ${name}\n*Members*: ${count}\n*Desc*: ${desc}`
        });
    }
});

CreatePlug({
    command: 'promoteall',
    category: 'group',
    desc: 'Promote all',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('I am not an admin');
        if (!message.groupAdmins.includes(message.sender)) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const participants = groupMetadata.participants.filter(participant => !participant.admin);
        if (participants.length === 0) return;
        const ToPromote = participants.map(participant => participant.id);
        const delay = 2000;
        const delayFunc = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const member of ToPromote) {
            await conn.groupParticipantsUpdate(message.user, [member], 'promote');
            await delayFunc(delay);
        }
        return;
    }
});

CreatePlug({
    command: 'demoteall',
    category: 'group',
    desc: 'Demote all',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('I am not an admin');
        if (!message.groupAdmins.includes(message.sender)) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const astral_id = conn.user.id.split(':')[0]; 
        const admins = groupMetadata.participants.filter(participant => participant.admin);
        if (admins.length === 0) return message.reply('No admins to demote.');
        const ToDemote = admins.filter(admin => admin.id.split(':')[0] !== astral_id).map(admin => admin.id);
        if (ToDemote.length === 0) return message.reply('No_(bot excluded)');
        const delay = 2000;
        const delayFunc = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const admin_id of ToDemote) {
            await conn.groupParticipantsUpdate(message.user, [admin_id], 'demote');
            await delayFunc(delay);
        }
        return;
    }
});
