const mongoose = require('mongoose');
const authStateSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    creds: { type: Object, required: true },
    keys: { type: Object, required: true },  
    createdAt: { type: Date, default: Date.now },
});

const AuthState = mongoose.model('AuthState', authStateSchema);
module.exports = AuthState;
