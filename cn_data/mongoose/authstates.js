const mongoose = require('mongoose');
const AuthState = mongoose.model(
  'AuthState',
  new mongoose.Schema(
    {
      session_id: { type: String, required: true, index: true },
      data_key: { type: String, required: true, index: true },
      data_value: { type: String, required: true },
    },
    { collection: 'session', timestamps: false }
  ).index({ session_id: 1, data_key: 1 }, { unique: true })
);

module.exports = AuthState;

