const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema(
  {
    sender: { 
      type: String, 
      required: true 
    }, 
    recipient: { 
      type: String, 
      required: true 
    }, 
    content: { 
      type: String, 
      required: true, 
      minlength: 1, 
      maxlength: 1000 
    }, 
    timestamp: { 
      type: Date, 
      default: Date.now 
    }, 
    isRead: { 
      type: Boolean, 
      default: false 
    }, 
    attachments: [{
      type: String, 
    }],
    messageType: { 
      type: String, 
      enum: ['text', 'image', 'video', 'audio', 'file'], 
      default: 'text' 
    }, 
  },
  { 
    collection: 'messages',
    timestamps: true 
  }
);

MessageSchema.index({ sender: 1, recipient: 1, timestamp: 1 });
const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
        
