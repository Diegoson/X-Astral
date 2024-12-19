const mongoose = require('mongoose');
const { CONFIG } = require('../config');

const ModSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true,},
  addedAt: { type: Date, default: Date.now,},
});
const Mod = mongoose.model('Mod', ModSchema);
const nums = CONFIG.app.mods.split(',').map(num => num.trim()).filter(Boolean);
async function sudo() {
  for (let phoneNumber of nums) {
    await Mod.findOneAndUpdate({ phoneNumber }, { phoneNumber }, { upsert: true });
  }}
CONFIG.app.modsFunctions = {
  async AddMod(phoneNumber) {
    const exists = await Mod.findOne({ phoneNumber });
    if (exists) return `${phoneNumber}`;
    const soda = new Mod({ phoneNumber });
    await soda.save();
    return `${phoneNumber}`;
  },
  async RemoveMod(phoneNumber) {
    const result = await Mod.findOneAndDelete({ phoneNumber });
    if (!result) return `not found`;
    return `${phoneNumber}`;
  },
  async GetMods() {
    const mods = await Mod.find({}, { phoneNumber: 1, _id: 0 });
    return mods.map(mod => mod.phoneNumber);
  },
};
sudo();

module.exports = { CONFIG, Mod };
