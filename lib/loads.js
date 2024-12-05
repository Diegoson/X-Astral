const fs = require('fs');
const path = require('path');

const commands = []; 

function getPlugins() {
    console.log('\n🟡 Executing plugins...\n');
    const commandsPath = path.join(__dirname, '..', 'commands');

    // Membuat direktori jika belum ada
    if (!fs.existsSync(commandsPath)) {
        console.error(`🔴 Directory not found: ${commandsPath}`);
        console.log('🟢 Creating "commands" directory...');
        fs.mkdirSync(commandsPath);
        console.log('✅ Directory "commands" created');
        return commands;
    }

    // Baca file-file di direktori commands
    const commandFiles = fs.readdirSync(commandsPath).filter(file =>
        file.endsWith('.js') // Hanya load file JavaScript
    );

    if (commandFiles.length === 0) {
        console.warn('⚠️ No plugin files found in commands directory');
        return commands;
    }

    commandFiles.forEach(file => {
        try {
            const commandPath = path.join(commandsPath, file);
            console.log(`🔵 Loading plugin: ${file}`);
            
            require(commandPath); // Gunakan require dengan path absolut
            console.log(`✅ Loaded: ${file}`);
        } catch (error) {
            console.error(`❌ Error loading plugin ${file}: ${error.message}`);
        }
    });

    console.log(`\n🟢 Successfully loaded ${commandFiles.length} plugins\n`);
    return commands;
}

module.exports = { getPlugins };