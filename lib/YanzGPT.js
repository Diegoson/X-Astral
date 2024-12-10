const axios = require('axios');  
const path = require('path');   
const fs = require('fs');   

const sessionsDir = path.join("./database/", "Yanz-GPT");

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

const sessionTimeouts = {};

const saveSession = (sender, sessionData) => {
  const filePath = path.join(sessionsDir, `${sender}.json`);
  fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
};

const loadSession = (sender) => {
  const filePath = path.join(sessionsDir, `${sender}.json`);
  if (fs.existsSync(filePath)) {
    const sessionData = fs.readFileSync(filePath);
    const parsedData = JSON.parse(sessionData);
    return Array.isArray(parsedData) ? parsedData : [];
  }
  return [];
};

const deleteSession = (sender) => {
  const filePath = path.join(sessionsDir, `${sender}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const scheduleSessionDeletion = (sender) => {
  if (sessionTimeouts[sender]) {
    clearTimeout(sessionTimeouts[sender]);
  }
  sessionTimeouts[sender] = setTimeout(
    () => {
      deleteSession(sender);
      delete sessionTimeouts[sender];
    },
    5 * 60 * 1000,
  ); 
};

exports.YanzGPT = (query, model, sender) => {
    return new Promise(async (resolve, reject) => {
    	let sessionData = await loadSession(sender);
        const response = await axios("https://yanzgpt.my.id/chat", {
            headers: {
                authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
                "content-type": "application/json"
            },
            data: {
                messages: [
                    {
                        role: "system",
                        content: `Kamu adalah Yanz-GPT`
                    },
                    ...sessionData,
                    {
                        role: "user",
                        content: query
                    }
                ],
                model: model
            },
            method: "POST"
        });
        let answer = response.data.choices[0]. message.content
          sessionData.push({
          role: "user",
          content: query
        });
        sessionData.push({
          role: "assistant",
          content: answer,
        });
        saveSession(sender, sessionData);
        scheduleSessionDeletion(sender); 
        resolve({ answer: answer, image: response.data.choices[0]. message.image || '' });
    });
};

//exports.clover('Perkenalkan nama saya Yanz Dev', 'yanzgpt-lagecy-v3.0', '6283899737438@s.whatsapp.net').then( a => console.log(a))