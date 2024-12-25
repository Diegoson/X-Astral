const mongoose = require("mongoose"),
    CONFIG = require('../../config'),
    fs = require("fs"),
    path = require("path");

const cxl = "./session",
    db_bb = path.join(cxl, "creds.json");
const SessionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    data: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Creds = mongoose.model("Creds", SessionSchema);
async function saveCreds(data) {
    const id = CONFIG.app.session_name;
    console.log(id);
    if (!id.startsWith("Naxor~")) throw new Error('ID must start with "Naxor~"');
    const db_cxl = id.replace("Naxor~", ""),
       creds = new Creds({ id: db_cxl, data });
    console.log(db_cxl);
    try {
        await creds.save();
        console.log("ID saved to MongoDB");
        if (!fs.existsSync(cxl)) fs.mkdirSync(cxl, { recursive: true });
        fs.writeFileSync(db_bb, JSON.stringify({ id: db_cxl, data }, null, 2));
        console.log("ID saved to creds.json");
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { saveCreds };
   
