#!/bin/bash

echo "[Sometimes]: Creating env, and installing requirements"
python3 -m venv venv > /dev/null 2>&1
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install fastapi psutil uvicorn > /dev/null 2>&1

echo "[Sometimes]: Installing npm packages"
npm install --silent > /dev/null 2>&1

echo "[Sometimes]: Starting API"
python main.py > /dev/null 2>&1 & 
sleep 3

echo "[Sometimes]: Building frontend"
npm run build > /dev/null 2>&1

echo "[Sometimes]: Starting frontend"
npx --yes serve -s dist