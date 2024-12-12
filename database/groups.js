const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['add', 'remove', 'promote', 'demote'],
        required: true
    },
    username: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    profile: {
        type: String, 
        required: false 
    }
});

const messages = {
    add: (username, timestamp) => `*Welcome*, ${username}\n*Joined at*: ${timestamp}\n*Enjoy your stay*`,
    remove: (username, timestamp) => `*Goodbye*, ${username}\n*Left at*: ${timestamp}\n*We will marete*`,
    promote: (username) => `*Congrast*, ${username}\n*Promoted to*: Admin\n*Great work🍀*`,
    demote: (username) => `*Notice*, ${username}\n*Demoted from*: Admin\n*Stay positive*`
};
messageSchema.methods.generateMessage = function() {
    const template = messages[this.action];
    if (template) {
        this.message = template(this.username, this.timestamp);
        return this.save();}
    return Promise.reject(new Error("not found"));
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
