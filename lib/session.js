const fs = require('fs');
const crypto = require('crypto');
const output = "./session/"; 
const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16); 
async function saveCreds(encryptedData) {
    if (!encryptedData.startsWith('Naxor~')) {
    throw new Error('start with "Naxor~"');}
    const data = encryptedData.replace('Naxor~', '');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const pth = output + "creds.json";
    if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });}
    fs.writeFileSync(pth, decrypted);}
    async function upload(filePath) {
    if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist');}
    const content = fs.readFileSync(filePath, 'utf8');
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `Naxor~${encrypted}`;
}
module.exports = { saveCreds, upload };
  
