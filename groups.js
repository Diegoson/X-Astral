function formatParticipant(participant) {
    return {
        username: `@${participant.split('@')[0]}`,
        timestamp: new Date().toLocaleTimeString(),
    };
}

async function sendTemplas(message, id, participant, template, imageurl = null) {
    const { username, timestamp } = formatParticipant(participant);
    const content = { 
        text: template(username, timestamp), 
        mentions: [participant]
    };
    if (imageurl) {
        content.image = { url: imageurl };
    }
    await message.send(id, content);
}

const templates = {
    welcome: (username, timestamp) => `
        ╭─────
        │ *Welcome*, ${username}
        │ *Joined at*: ${timestamp}
        │ *Enjoy your stay*
        ╰─────`,
    goodbye: (username, timestamp) => `
        ╭─────
        │ *Goodbye*, ${username}
        │ *Left at*: ${timestamp}
        │ *See you again*
        ╰─────`,
    promote: (username) => `
        ╭─────
        │ *${username}*
        │ *Youve been promoted*
        │ *Status*: Admin
        ╰─────`,
    demote: (username) => `
        ╭─────
        │ *${username}*
        │ *Youve been demoted*
        │ *Status*: Member
        ╰─────`,
};

const sendWelcome = (message, id, participant) => 
    sendTemplas(message, id, participant, templates.welcome, "https://i.ibb.co/dJkw8tj/pngtree-neon-efficiency-modern-cool-welcome-label-png-image-3311880.jpg");
const sendGoodbye = (message, id, participant) => 
    sendTemplas(message, id, participant, templates.goodbye, "https://i.ibb.co/cFh8Rsm/45271efec0f4663b8acd3dceee097df6.jpg");
const sendPromote = (message, id, participant) => 
    sendTemplas(message, id, participant, templates.promote);
const sendDemote = (message, id, participant) => 
    sendTemplas(message, id, participant, templates.demote);
module.exports = { sendWelcome, sendGoodbye, sendPromote, sendDemote };
