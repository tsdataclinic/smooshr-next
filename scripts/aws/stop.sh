#!/bin/bash
# In this script we stop all servers.

# Load NVM
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# The `|| :` suppresses the exit code of 1 in case there are no
# services running and forces pm2 to return an exit code 0
pm2 stop all || :
pm2 delete all || :
