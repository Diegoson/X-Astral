const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    id: { type: String, required: true },
    welcome: { type: Boolean, default: true },
    welcome: { type: String,default: "*Welcome*: @pushname\n*To*: @gc_name\n*Member*: @number\n*Time*: @time"},
    goodbye: { type: Boolean, default: true },
    goodbye: { type: String,default: "*Goodbye*: @pushname\n*From*: @gc_name\n*Time*: @time\n*Negro dusted*"},
});
const Group = mongoose.model("Group", GroupSchema);
async function settingz(id) {
    let group = await Group.findOne({id});
    if (!group) {
        group = new Group({id});
        await group.save();}
    return group;
}
module.exports = { settingz };
        
