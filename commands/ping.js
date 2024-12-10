const { CreatePlug } = require('../lib/commands');

CreatePlug({
    command: 'ping',
    category: 'misc', // Perbaikan typo kategori
    desc: 'Check bot latency', // Deskripsi lebih informatif
    execute: async (message, conn) => {
        try {
            // Validasi data
            if (!message || !message.user) {
                throw new Error('Message object or user is undefined.');
            }

            const start = Date.now(); // Waktu awal
            await conn.sendMessage(message.user, { text: '```Ping!```' }); // Kirim pesan Ping
            
            const end = Date.now(); // Waktu setelah pesan terkirim
            const latency = end - start; // Hitung latensi
            
            await conn.sendMessage(message.user, { 
                text: `*Pong!*\n \`\`\`${latency}\`\`\` *ms*` // Kirim pesan Pong
            });
        } catch (error) {
            console.error(`Error in "ping" command: ${error.message}`);
            await conn.sendMessage(message.user || 'default', {
                text: `Error pada command "ping":\n${error.message}`,
            });
        }
    },
});