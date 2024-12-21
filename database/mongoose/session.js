const mongoose = require('mongoose');
const { initAuth } = require('whiskeySockets/baileys');
const AuthState = require('./models/Auth');
const mongo_url = 'mongodb+srv://Xcelsama:Xcel@xcelsama.qpklf.mongodb.net/?retryWrites=true&w=majority&appName=Xcelsama';

function logAction(action, sessionId) {
console.log(`[MongoDB] ${action} | Session ID: ${sessionId}`);
}
const mongoDBAuthState = async (sessionId, getSession) => {
    try {
     if (!sessionId.startsWith('Naxor~')) {
        console.log(`[MongoDB] Skipping session ${sessionId}, as it doesnt match`);
        return null;}
        const { creds, keys } = await initAuth(sessionId);
        const session = await getSession(sessionId);
        if (!session) {
        console.log(`[MongoDB] No session${sessionId}`);
        return null;}
        await saveSession(sessionId, { creds, keys });
        return { state: { creds, keys } };
    } catch (err) {
        console.error(`[MongoDB] ${sessionId}:`, err);
        throw err;
    }};
const saveSession = async (sessionId, { creds, keys }) => {
    try { const session = await AuthState.findOneAndUpdate(
            { sessionId },
            { sessionId, creds, keys, createdAt: new Date() },
            { upsert: true, new: true });
        return session;
    } catch (err) {
        console.error(` (${sessionId}):`, err);
        throw err;
    }};

module.exports = { mongoDBAuthState, saveSession };
      
