#!/bin/bash
# In this script we start the necessary servers.

# Load NVM
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

APP_NAME=ek12
cd /srv/$APP_NAME
source venv/bin/activate

# Start the frontend server
pm2 start "serve -s dist" --name frontend

# Start the API server
pm2 start "PYTHONPATH=. uvicorn views:app --log-config ./api-log-config.json --app-dir server/api" --name server
