const axios = require('axios');  
const path = require('path');   
const fs = require('fs');   

const sessions = path.join("./lib/database/", "Astral");
if (!fs.existsSync(sessions)) {
  fs.mkdirSync(sessions);
}
const out_time = {};
const save_dun = (sender, session_db) => {
  const filePath = path.join(sessions, `${sender}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session_db, null, 2));
};
const loadSession = (sender) => {
  const filePath = path.join(sessions, `${sender}.json`);
  if (fs.existsSync(filePath)) {
    const session_db = fs.readFileSync(filePath);
    const parse = JSON.parse(session_db);
    return Array.isArray(parse) ? parse : [];
  }
  return [];
};

const delete_dun = (sender) => {
  const filePath = path.join(sessions, `${sender}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const scheduleSessionDeletion = (sender) => {
  if (out_time[sender]) {
    clearTimeout(out_time[sender]);
  } out_time[sender] = setTimeout(
    () => {
      delete_dun(sender);
      delete out_time[sender];
    },
    5 * 60 * 1000,
  ); 
};

exports.YanzGPT = (query, model, sender) => {
    return new Promise(async (resolve, reject) => {
    	let session_db = await loadSession(sender);
        const response = await axios("https://yanzgpt.my.id/chat", {
            headers: {
                authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
                "content-type": "application/json"
            },
            data: {
                messages: [
                    {
                        role: "system",
                        content: `Youre Astral`
                    },
                    ...session_db,
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
          session_db.push({
          role: "user",
          content: query
        });
        sessionData.push({
          role: "assistant",
          content: answer,
        });
        save_dun(sender, session_db);
        scheduleSessionDeletion(sender); 
        resolve({ answer: answer, image: response.data.choices[0]. message.image || '' });
    });
};
