const commands = [];
function CreatePlug({ command, category, desc, execute }) {
    const commandData = { command, category, desc, execute };
    commands.push(commandData);
}

module.exports = {
    commands,
    CreatePlug
};