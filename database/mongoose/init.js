const proto = require('baileys');
const { initAuthCreds } = require('baileys');
const { AuthState } = require('./authstates');
const mongoose = require('mongoose');
const { jsonToBuffer, bufferToJSON, profile } = require('./Func');

const authStateSchema = new mongoose.Schema(
  {session_id: { type: String, required: true },
    data_key: { type: String, required: true },
    data_value: { type: String, required: true },},
  { collection: 'session', timestamps: false });

const AuthState = mongoose.model('AuthState', authStateSchema);
const mongooseAuthState = async (sessionId, logger) => {
  const writeData = async (key, data) => {
    try {
      const serialized = JSON.stringify(bufferToJSON(data));
      await AuthState.findOneAndUpdate(
        { session_id: sessionId, data_key: key },
        { data_value: serialized },
        { upsert: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const readData = async (key) => {
    try {
      const record = await AuthState.findOne({ session_id: sessionId, data_key: key });
      return record ? jsonToBuffer(JSON.parse(record.data_value)) : null;
    } catch (error) {
      console.log(error);
    }
  };

  const creds = (await profile('readCreds', () => readData('creds'), logger)) || initAuthCreds();
  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        return profile(
          'keys.get',
          async () => {
            const keys = ids.map((id) => `${type}-${id}`);
            try {
              const records = await AuthState.find({
                session_id: sessionId,
                data_key: { $in: keys },
              });
              return records.reduce((acc, record) => {
                const id = record.data_key.split('-')[1];
                let value = jsonToBuffer(JSON.parse(record.data_value));
                if (type === 'app-state-sync-key') {
                  value = proto?.Message?.AppStateSyncKeyData?.fromObject(value);
                }
                acc[id] = value;
                return acc;
              }, {});
            } catch (error) {
              console.log(error);
            }
          },
          logger
        );
      },
      set: async (data) => {
        return profile(
          'keys.set',
          async () => {
            const entries = [];
            for (const [type, ids] of Object.entries(data)) {
              for (const [id, value] of Object.entries(ids || {})) {
                entries.push({
                  session_id: sessionId,
                  data_key: `${type}-${id}`,
                  data_value: JSON.stringify(bufferToJSON(value)),
                });
              }
            }
            try {
              await AuthState.bulkWrite(
                entries.map((entry) => ({
                  updateOne: {
                    filter: { session_id: sessionId, data_key: entry.data_key },
                    update: { $set: { data_value: entry.data_value } },
                    upsert: true,
                  },
                }))
              );
            } catch (error) {
              console.log(error);
            }
          },
          logger
        );
      },
    },
  };

  return {
    state,
    saveCreds: () => profile('saveCreds', () => writeData('creds', state.creds), logger),
    deleteSession: async () => {
      try {
        await AuthState.deleteMany({ session_id: sessionId });
      } catch (error) {
        console.log(error);
      }
    },
  };
};

module.exports = mongooseAuthState;
  
