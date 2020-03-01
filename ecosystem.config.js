module.exports = {
  apps: [
    {
      name: 'Outboard-Crash-Pants',
      script: './index.js',
      watch: true,
      // Delay between restart
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'log', 'dist', 'out', 'docs'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
