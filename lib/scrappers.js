const fetch = require('node-fetch');

async function facebook_dl(url) {
    const apiz = `https://diegoson-naxor-api.hf.space/facebook?url=${url}`;
    try { const res = await fetch(apiz);
        if (!res.ok) {
            throw new Error(`${res.statusText}`);}
        const jsonData = await res.json();
        if (jsonData.status === 200 && jsonData.data) {
            const hdUrl = jsonData.data; 
            return {
                "HD (720p)": hdUrl["720p (HD)"],
                "SD (360p)": hdUrl["360p (SD)"]
            };
        } else {
            return { error: "No_video_data" };
        }} catch (err) {
        return { error: err.message };
    }}

module.exports = facebook_dl;      
