const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const fs = require("fs");

function generateRandomLetters(length) {
  let result = "";
  const isSize = 26;
  for (let i = 0; i < length; i++) {
    const values = Math.floor(Math.random() * isSize);
    const matter = String.fromCharCode("a".charCodeAt(0) + values);
    result += matter;
  }
  return result;
}

exports.tmpFile = async (fileBuffer) => {
  try {
    const { mime, ext } = await fromBuffer(fileBuffer);
    const formData = new FormData();
    formData.append("files[]", fileBuffer, {
      filename: `file.${ext}`,
      contentType: mime,
    });
    const response = await axios.post("https://uguu.se/upload", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.files[0].url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
