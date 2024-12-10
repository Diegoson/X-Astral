const { CreatePlug } = require('../lib/commands');
const fs = require('fs');
const { fetchJson } = require('../lib/functions'); // Pastikan Anda memiliki fungsi ini
const { tmpFile } = require('../lib/upload'); // Pastikan Anda memiliki fungsi ini
const { YanzGPT } = require('../lib/YanzGPT'); // Pastikan Anda memiliki fungsi ini

CreatePlug({
    command: 'ai',
    category: 'ai',
    desc: 'Gunakan AI untuk menjawab pertanyaan atau menganalisis gambar',
    execute: async (message, conn) => {
        let text = '';

        // Coba berbagai cara untuk mendapatkan text
        if (message.text) {
            text = message.text;
        } else if (message.body) {
            text = message.body;
        } else if (message.caption) {
            text = message.caption;
        }

        // Pemeriksaan awal yang lebih aman
        if (!text) {
            return message.reply(`*Cara Penggunaan Perintah AI:*

- Ketik perintah *${CONFIG.app.prefix}ai* diikuti dengan pertanyaan Anda.
- Untuk menggunakan model *pro*, tambahkan kata *pro* di awal pertanyaan Anda.

*Contoh:*
- _${CONFIG.app.prefix}ai Apa itu AI?_
- _${CONFIG.app.prefix}ai pro Jelaskan teori relativitas._

*Catatan:* Jika Anda tidak menyebutkan model, bot akan menggunakan model default.`);
        }

        try {
            // Penanganan gambar/video dengan pemeriksaan tambahan
            const isImageOrVideo = 
                message.type === 'imageMessage' || 
                message.type === 'videoMessage' || 
                message.message?.imageMessage || 
                message.message?.videoMessage;

            if (isImageOrVideo) {
                // Pastikan menggunakan metode react yang aman
                if (message.key) {
                    await conn.sendMessage(message.user, { 
                        react: { 
                            text: "🔎", 
                            key: message.key 
                        } 
                    });
                }

                const media = await message.media();
                if (!media) {
                    return message.reply('Tidak dapat mengunduh media.');
                }

                const tph = await tmpFile(media);
                
                const query = text || "Tolong jelaskan gambar/video ini dengan detail";
                const big = await fetchJson(
                    `https://api.yanzbotz.live/api/ai/gemini-image?url=${tph}&query=${query}&apiKey=yanzdev`
                );

                await message.reply(big.result);

                // Reaksi sukses
                if (message.key) {
                    await conn.sendMessage(message.user, { 
                        react: { 
                            text: "✅", 
                            key: message.key 
                        } 
                    });
                }
            } 
            // Penanganan teks
            else {
                let model = "yanzgpt-revolution-25b-v3.0"; // model default
                let queryText = text.trim();

                // Cek model
                const qWords = queryText.split(/\s+/);
                if (qWords[0].toLowerCase() === "pro") {
                    model = "yanzgpt-legacy-72b-v3.0";
                    qWords.shift();
                    queryText = qWords.join(" ");
                } else if (qWords[0].toLowerCase() === "default") {
                    model = "yanzgpt-revolution-25b-v3.0";
                    qWords.shift();
                    queryText = qWords.join(" ");
                }

                // Reaksi awal
                if (message.key) {
                    await conn.sendMessage(message.user, { 
                        react: { 
                            text: "🔎", 
                            key: message.key 
                        } 
                    });
                }

                // Panggil YanzGPT
                const big = await YanzGPT(
                    queryText.trim(),
                    model,
                    message.sender
                );

                // Bersihkan teks jawaban
                const ynz = big.answer
                    .replace(/####/g, "")
                    .replace(/###/g, "")
                    .replace(/##/g, "")
                    .replace(/\*\*/g, "*");

                await message.reply(ynz);

                // Kirim gambar jika ada
                if (big.image) {
                    try {
                        // Reaksi gambar
                        if (message.key) {
                            await conn.sendMessage(message.user, { 
                                react: { 
                                    text: "🖼️", 
                                    key: message.key 
                                } 
                            });
                        }

                        const buffer = Buffer.from(big.image, "base64");
                        await conn.sendMessage(message.user, {
                            image: buffer,
                            caption: "Image From Yanz-GPT",
                            mimetype: "image/jpeg"
                        });
                    } catch (imageError) {
                        console.log("Error mengirim gambar:", imageError);
                    }
                }

                // Reaksi sukses
                if (message.key) {
                    await conn.sendMessage(message.user, { 
                        react: { 
                            text: "✅", 
                            key: message.key 
                        } 
                    });
                }
            }
        } catch (error) {
            console.error('AI Command Error:', error);
            
            // Reaksi error
            if (message.key) {
                await conn.sendMessage(message.user, { 
                    react: { 
                        text: "❌", 
                        key: message.key 
                    } 
                });
            }
            
            await message.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
        }
    }
});