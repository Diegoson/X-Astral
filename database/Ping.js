const mongoose = require('mongoose');

const pingSchema = new mongoose.Schema({
start: { type: Number, default: () => Date.now(), required: true },
end: { type: Number, default: null, },
duration: { type: Number,  default: null, }});
pingSchema.pre('save', function (next) {
  if (!this.end) {
    this.end = Date.now(); 
  }
  this.duration = this.end - this.start; 
  next();
});

module.exports = mongoose.model('Ping', pingSchema);
               
