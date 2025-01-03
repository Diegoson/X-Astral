const fs = require('fs'), 
path = require('path');

async function getPlugins() {
    const commands = [], dir = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    console.log('Loading plugins...');
    fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(file => {
        try { require(path.join(dir, file)); commands.push(file); } 
        catch (err) { console.error(`erro ${file}: ${err.message}`); }
    });
    console.log(`Plugins loaded: ${commands.length}`);
    return commands;
}

module.exports = { getPlugins };
            
