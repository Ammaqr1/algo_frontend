#!/bin/bash

git pull
pnpm build
sudo rm -rf /var/www/frontend/*
sudo cp -r dist/* /var/www/frontend/

echo "Frontend deployed successfully!"