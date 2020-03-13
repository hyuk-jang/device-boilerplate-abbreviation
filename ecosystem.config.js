module.exports = {
  apps: [
    {
      name: 'ZGB_BAT',
      script: 'index.js',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'dist', 'log', '.vscode', 'out', 'docs'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
        // Project Info
        PJ_MAIN_ID: 'ZGB_BAT',
        // DB
        // PJ_DB_HOST: '192.168.0.10',
        PJ_DB_DB: 'outboard',
        PJ_DB_USER: 'root',
        PJ_DB_PW: 'marine1234*',
        // Device Connect Info
        CONN_TYPE: 'serial',
        CONN_SUBTYPE: 'parser',
        CONN_BR: 115200,
        CONN_PORT: '/dev/ttyAMA0',
        CONN_CONFIG_PARSER: 'delimiterParser',
        CONN_CONFIG_DELIMITER_HX: '0d0a',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ZGB_PIR',
      script: 'index.js',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'dist', 'log', '.vscode', 'out', 'docs'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
        // Project Info
        PJ_MAIN_ID: 'ZGB_PIR',
        // DB
        // PJ_DB_HOST: '192.168.0.11',
        PJ_DB_DB: 'outboard',
        PJ_DB_USER: 'root',
        PJ_DB_PW: 'marine1234*',
        // Device Connect Info
        CONN_TYPE: 'serial',
        CONN_SUBTYPE: 'parser',
        CONN_BR: 115200,
        CONN_PORT: '/dev/ttyAMA0',
        CONN_CONFIG_PARSER: 'delimiterParser',
        CONN_CONFIG_DELIMITER_HX: '0d0a',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'BLE_SCAN',
      script: 'index.js',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      autorestart: true,
      watch: true,
      watch_delay: 1000,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'dist', 'log', '.vscode', 'out', 'docs'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
        // Project Info
        PJ_MAIN_ID: 'BLE_SCAN',
        // DB
        // PJ_DB_HOST: '192.168.0.12',
        PJ_DB_DB: 'outboard',
        PJ_DB_USER: 'root',
        PJ_DB_PW: 'marine1234*',
        // Device Connect Info
        CONN_TYPE: 'serial',
        CONN_SUBTYPE: 'parser',
        CONN_BR: 115200,
        CONN_PORT: '/dev/ttyAMA0',
        CONN_CONFIG_PARSER: 'delimiterParser',
        CONN_CONFIG_DELIMITER_HX: '0d0a',
        // Bluetooth Scan Info
        // BLE_SCAN_INTERVAL_SEC: '60',
        // BLE_SCAN_DURATION_SEC: '10',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
