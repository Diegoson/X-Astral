const fs = require('fs');
const path = require('path');

const commands = []; 
function getPlugins() {
    console.log('\n🟡 Executing plugins...\n');
    const commandis = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandis)) {
        console.error(`🔴 Not found: ${commandis}`);
        console.log('🟢 Creating "commands"...');
        fs.mkdirSync(commandis);
        console.log('✅ "commands" created');
        return commands;
    }

    const commander = fs.readdirSync(commandis).filter(file =>
        file.endsWith('.js'));
    if (commander.length === 0) {
        console.warn('no plugin_found');
        return commands;
    }
    commander.forEach(file => {
        try {
            const commandi = path.join(commandis, file);
            console.log(`🔵 Loading: ${file}`);          
            require(commandi); 
            console.log(`✅ Loaded: ${file}`);
        } catch (error) {
            console.error(`error: ${file}: ${error.message}`);
        }
    });
    console.log(`\n🟢 Successfully: ${commander.length} plugins\n`);
    return commands;
}

module.exports = { getPlugins };
