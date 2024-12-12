const fs = require('fs');
const path = require('path');
const Plugin = require('./getPlugins');

const commands = [];
async function getPlugins() {
    console.log('\n🟡 Executing plugins...\n');
    const commandis = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandis)) {
        console.error(`🔴 Not_found: ${commandis}`);
        console.log('🟢 Creating "commands"...');
        fs.mkdirSync(commandis);
        console.log('✅ "commands" created');
        return commands;}
    const commander = fs.readdirSync(commandis).filter(file => file.endsWith('.js'));
    if (commander.length === 0) {
        console.warn('No plugins found');
        return commands;}
    for (const file of commander) {
        const filePath = path.join(commandis, file);
        try {
            console.log(`🔵 Loading: ${file}`);
            require(filePath);
            console.log(`✅ Loaded: ${file}`);
            await Plugin.findOneAndUpdate(
                { name: file },
                { status: 'loaded', path: filePath, error: null },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error(`🔴=> ${file}: ${error.message}`);
            await Plugin.findOneAndUpdate(
                { name: file },
                { status: 'error', path: filePath, error: error.message },
                { upsert: true, new: true }
            );
        }}

        console.log(`\n🟢 Done_${commander.length} plugins\n`);
    return commands;
}

module.exports = { getPlugins };
                                                                             
