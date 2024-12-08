const CONFIG = require("../config");
const templates = {
    en: {
        welcome: `
╭─────【 *Welcome* 】
│ *Welcome*, {username}
│ *Joined at*: {timestamp}
│ *Enjoy your stay*
╰─────∘
`,
        goodbye: `
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
│ *Great work*
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
        welcome: `
╭─────【 *Bienvenido* 】
│ *Bienvenido*, {username}
│ *Unido en*: {timestamp}
│ *¡Disfruta tu estadía*
╰─────∘
`,
        goodbye: `
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
│ *¡Buen trabajo*
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
const cn_welcom = (action, username, timestamp) => {
    const language = CONFIG.app.language || "en";
    const template = templates[language]?.[action];
    if (!template) return null;
    return template
        .replace("{username}", username)
        .replace("{timestamp}", timestamp);
};
const custom_cn = {
    add: null,
    remove: null,
    promote: null,
    demote: null,
};
const setCustom = (action, template) => {
    if (custom_cn[action] !== undefined) {
        custom_cn[action] = template;
    }
};
const getMessage = (action, username, timestamp) => {
    if (custom_cn[action]) {
        return custom_cn[action]
            .replace("{username}", username)
            .replace("{timestamp}", timestamp);
    }
    return cn_welcome(action, username, timestamp);
};

module.exports = { getMessage, setCustom };
                           
