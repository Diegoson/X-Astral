const fs = require('fs');
const crypto = require('crypto');

const cxl = './packs.json';
async function botpic() {
  const data = await fs.promises.readFile(cxl, 'utf8');
  const _msg = JSON.parse(data);
  const _naxor = parseInt(crypto.randomBytes(4).toString('hex'), 16) % _msg.IMAGES.length;
  const _image = _msg.IMAGES[_naxor];
  const  Obj = {
    url: _image.url,
    name: _image.name
  };
  return botpicObj;
}

module.exports = { botpic };
    
