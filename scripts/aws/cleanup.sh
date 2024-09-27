#!/bin/bash
# In this script we cleanup any artifacts left from the previous deployment.

APP_NAME=ek12

if [ -d /srv/$APP_NAME ]; then
  rm -rf /srv/$APP_NAME
fi

mkdir /srv/$APP_NAME
