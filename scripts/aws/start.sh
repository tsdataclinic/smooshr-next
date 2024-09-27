#!/bin/bash
# In this script we start the necessary servers.

# Load NVM
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

APP_NAME=ek12
cd /srv/$APP_NAME

# Start the frontend server
pm2 start "serve -s build" --name frontend

# Start the API server
# TODO: add command
