#!/bin/bash
# In this script we install dependencies and compile the app's bundles.

# Load NVM
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

APP_NAME=ek12
cd /srv/$APP_NAME

# Install all npm dependencies
yarn install

# Build the API server
cp /srv/envs/server.env .env.server
python3 -m venv venv
source venv/bin/activate
yarn py-install

# Run the db migration
yarn db-upgrade

# Build the frontend
cp /srv/envs/frontend.env .env.frontend
yarn build
