// Configurations to run the compiled servers using pm2
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'serve',
      args: '-s dist',
      env_staging: {
        NODE_ENV: 'staging',
      },
    },
    {
      name: 'server',
      script: 'uvicorn',
      args: 'views:app --log-config ./api-log-config.json --app-dir server/api',
      env_staging: {
        PYTHONPATH: '.',
      },
    },
  ],
};
