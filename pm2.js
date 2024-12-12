const fs = require('fs');
const config = {
  appName: 'x_astral',
  scriptPath: './index.js', 
  instances: 1,
  execMode: 'fork', 
  restartDelay: 5000,
  maxMemory: '1G',
  watchFiles: true,
  enableTimestamps: true,
};

const PM2Config = () => ({
  apps: [
    {
      name: config.appName,
      script: config.scriptPath,
      exec_mode: config.execMode,
      instances: config.instances,
      restart_delay: config.restartDelay,
      watch: config.watchFiles,
      max_memory_restart: config.maxMemory,
      time: config.enableTimestamps,
    },
  ],
});

module.exports = PM2Config();
                    
