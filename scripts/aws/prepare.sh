#!/bin/bash
# In this script we install dependencies and compile the app's bundles.

APP_NAME=ek12
cd /srv/$APP_NAME

# Install all npm dependencies
yarn install

# Build the API server
# TODO: add commands to build the API server, if it has one

# Run the db migration
# TODO: add commands to migrate any databases, if it has one

# Build the frontend
cp /srv/envs/frontend.env .env.frontend
yarn build