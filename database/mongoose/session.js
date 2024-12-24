const mongoose = require("mongoose"), fs = require("fs"), path = require("path");
const cxl = "./session", db_bb = path.join(cxl, "creds.json");

const SessionSchema = new mongoose.Schema({
id: {type: String, required: true}, 
data: {type: String, required: true}, 
createdAt: {type: Date, default: Date.now}});
const Creds = mongoose.model("Creds", SessionSchema);
async function saveCreds(id, data) {
if (!id.startsWith("Naxor~")) throw new Error('ID must start with "Naxor~"');
   const db_cxl = id.replace("Naxor~", ""), creds = new Creds({id: db_cxl, data}); try {
    await creds.save();
    if (!fs.existsSync(cxl)) fs.mkdirSync(cxl, {recursive: true});
    fs.writeFileSync(db_bb, JSON.stringify({id: db_cxl, data}, null, 2));
    console.log("id_saved to MongoDB");
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { saveCreds };
