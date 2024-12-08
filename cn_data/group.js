const CONFIG = require("../config");
const templates = {
    en: {
        add: `
╭─────【 *Welcome* 】
│ *Welcome*, {username}
│ *Joined at*: {timestamp}
│ *Enjoy your stay*
╰─────∘
`,
        remove: `
╭─────【 *Goodbye* 】
│ *Goodbye*, {username}
│ *Left at*: {timestamp}
│ *We will miss you*
╰─────∘
`,
        promote: `
╭─────【 *Promoted* 】
│ *Congratulations*, {username}
│ *Promoted to*: Admin
│ *Great work🍀*
╰─────∘
`,
        demote: `
╭─────【 *Demoted* 】
│ *Notice*, {username}
│ *Demoted from*: Admin
│ *Stay positive*
╰─────∘
`,
    },
    es: {
        add: `
╭─────【 *Bienvenido* 】
│ *Bienvenido*, {username}
│ *Unido en*: {timestamp}
│ *¡Disfruta tu estadía*
╰─────∘
`,
        remove: `
╭─────【 *Adiós* 】
│ *Adiós*, {username}
│ *Salida en*: {timestamp}
│ *¡Te extrañaremos*
╰─────∘
`,
        promote: `
╭─────【 *Ascendido* 】
│ *Felicidades*, {username}
│ *Ascendido a*: Admin
│ *¡Buen trabajo🍀*
╰─────∘
`,
        demote: `
╭─────【 *Degradado* 】
│ *Aviso*, {username}
│ *Degradado de*: Admin
│ *¡Ánimo*
╰─────∘
`,
    },
};

const getMessage = (action, username, timestamp) => {
    const language = CONFIG.app.language || "en";
    const template = templates[language]?.[action];
    if (!template) return null;
    return template
        .replace("{username}", username)
        .replace("{timestamp}", timestamp);
};

module.exports = { getMessage };
 
