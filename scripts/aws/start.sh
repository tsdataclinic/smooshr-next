#!/bin/bash
# In this script we start the necessary servers.

APP_NAME=ek12
cd /srv/$APP_NAME

# Start the frontend server
pm2 start "serve -s build" --name frontend

# Start the API server
# TODO: add command
