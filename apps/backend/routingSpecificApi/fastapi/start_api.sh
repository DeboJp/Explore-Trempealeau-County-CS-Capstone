#!/usr/bin/env bash
set -e

# From routing-backend/fastapi/
python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

# Bind to all interfaces so phones/tablets on the same network can reach it
uvicorn main:app --host 0.0.0.0 --port 8000
