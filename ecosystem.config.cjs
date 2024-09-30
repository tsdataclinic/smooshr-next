// Configurations to run the compiled servers using pm2
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      env_staging: {
        NODE_ENV: 'staging',
      },
    },
    {
      name: 'server',
      script: './venv/bin/uvicorn',
      args: 'views:app --log-config ./api-log-config.json --app-dir server/api',
      interpreter: './venv/bin/python3',
      env_staging: {
        PYTHONPATH: '.',
      },
    },
  ],
};
