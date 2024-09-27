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

# Start the servers according to ecosystem.config.js
pm2 start ecosystem.config.cjs --env staging
