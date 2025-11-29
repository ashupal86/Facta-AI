# Facta AI - Project Nanda Agent

This directory contains the Python agent for deploying Facta AI to the Project Nanda ecosystem.

## 🚀 Prerequisites

1.  **Python 3.10+**
2.  **Facta AI Backend** running locally on port 4000 (or a public URL).
3.  **Ngrok Auth Token** (for public deployment).

## 🛠️ Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment**:
    Copy `.env.example` to `.env` and fill in your details:
    ```bash
    cp .env.example .env
    ```
    *   `NGROK_AUTH_TOKEN`: Get this from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).
    *   `FACTA_BACKEND_URL`: Default is `http://localhost:4000/api/analysis/sync`.

## 🏃‍♂️ Running the Agent

### Option 1: Local Development (Recommended)
Use the provided script to run the agent without a tunnel:
```bash
./run_agent.sh
```

### Option 2: Manual Start
1.  **Start the Agent**:
    ```bash
    python agent.py
    ```

2.  **Verify**:
    You should see output like:
    ```
    🤖 Agent 'facta-ai-agent' ready!
    📡 Listening on port 7000
    🌐 Tunnel URL: https://<random-id>.ngrok.io
    ```

## 🧪 Testing

You can test the agent locally using `curl`:

```bash
curl -X POST http://localhost:7000/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "content": {"text": "The earth is flat", "type": "text"},
    "role": "user",
    "conversation_id": "test-123"
  }'
```

## 🌐 Deployment

When `ENABLE_TUNNEL=true` is set in `.env`, the agent automatically creates a public tunnel and registers itself with the Mumbai Hacks registry.

Ensure your **Facta AI Backend** is also running! If the backend is local, the agent (running locally) can reach it at `localhost:4000`. If you deploy the agent to a cloud server, you must also deploy the backend or expose it via ngrok.
