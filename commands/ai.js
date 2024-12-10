const { CreatePlug } = require('../lib/commands');
const fs = require('fs');
const { fetchJson } = require('../lib/functions');
const { tmpFile } = require('../lib/upload'); 
const { YanzGPT } = require('../lib/chat');

CreatePlug({
    command: 'ai',
    category: 'ai',
    desc: 'ai_chat',
    execute: async (message, conn) => {
        let text = '';
        if (message.text) {
            text = message.text;
        } else if (message.body) {
            text = message.body;
        } else if (message.caption) {
            text = message.caption;
        }
         if (!text) {
            return message.reply(`use ${CONFIG.app.prefix}ai + ur question
*Examples:*
${CONFIG.app.prefix}ai What is AI?
${CONFIG.app.prefix}ai pro Explain xnxx`);
         } try {
            const isImageOrVideo = 
                message.type === 'imageMessage' || 
                message.type === 'videoMessage' || 
                message.message?.imageMessage || 
                message.message?.videoMessage;
            if (isImageOrVideo) {
               if (message.key) {
                    await conn.send(message.user, { 
                        react: { 
                            text: "💘", 
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
                if (message.key) {
                    await conn.send(message.user, { 
                        react: { 
                            text: "✅", 
                            key: message.key 
                        } 
                    });
                }
            } else {
                let model = "yanzgpt-revolution-25b-v3.0";
                let queryText = text.trim();
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
                if (message.key) {
                    await conn.send(message.user, { 
                        react: { 
                            text: "💘", 
                            key: message.key 
                        } 
                    });
                }
                   const big = await YanzGPT(
                    queryText.trim(),
                    model,
                    message.sender
                );
                   const ynz = big.answer
                    .replace(/####/g, "")
                    .replace(/###/g, "")
                    .replace(/##/g, "")
                    .replace(/\*\*/g, "*");
                await message.reply(ynz);
                if (big.image) {
                    try {
                        if (message.key) {
                            await conn.send(message.user, { 
                                react: { 
                                    text: "💘", 
                                    key: message.key 
                                } 
                            });
                        }

                        const buffer = Buffer.from(big.image, "base64");
                        await conn.send(message.user, {
                            image: buffer,
                            caption: "From X Astral",
                            mimetype: "image/jpeg"
                        });
                    } catch (imageError) {
                        console.log(imageError);
                    }
                }
           if (message.key) {
                    await conn.send(message.user, { 
                        react: { 
                            text: "✅", 
                            key: message.key 
                        } 
                    });
                }
            }
        } catch (error) {
            console.error(error);
            if (message.key) {
                await conn.send(message.user, { 
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
