#!/bin/bash
source venv/bin/activate

export ENABLE_TUNNEL=true
export PORT=7000
export FACTA_BACKEND_URL=http://192.168.22.12:4000/api/analysis/sync

echo "🚀 Starting Facta AI Agent..."
python agent.py
