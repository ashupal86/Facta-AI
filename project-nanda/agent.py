#!/usr/bin/env python3
import os
import requests
import json
from dotenv import load_dotenv
from nanda_core import NANDA
from pyngrok import ngrok

load_dotenv()

FACTA_BACKEND_URL = os.getenv("FACTA_BACKEND_URL")

# ============================================
# CUSTOMIZE THIS FUNCTION FOR YOUR AGENT
# ============================================
def agent_logic(message: str, conversation_id: str):
    print(f"📩 Received message: {message}")
    
    try:
        payload = {"claim": message}
        headers = {"Content-Type": "application/json"}
        
        print(f"🚀 Forwarding to Backend: {FACTA_BACKEND_URL}")
        response = requests.post(FACTA_BACKEND_URL, json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            data = response.json()

            result = data.get("result", {})
            verdict_data = result.get("verdict", {})

            verdict = verdict_data.get("verdict", "Unknown")
            explanation = verdict_data.get("explanation", "No explanation provided.")

            reply = f"🔍 Verdict: {verdict}\n\n{explanation}\n\n_Analysis by Facta AI_"

            return {
                "type": "message",
                "content": reply
            }

        else:
            return {
                "type": "message",
                "content": f"⚠️ Error from Facta AI Backend: {response.status_code} - {response.text}"
            }

    except requests.exceptions.ConnectionError:
        return {
            "type": "message",
            "content": "❌ Could not connect to Facta AI Backend. Is it running?"
        }

    except Exception as e:
        return {
            "type": "message",
            "content": f"❌ An error occurred: {str(e)}"
        }

# ============================================
# DO NOT MODIFY BELOW (NEST Infrastructure)
# ============================================
if __name__ == "__main__":
    port = int(os.getenv("PORT", "7000"))

    # Setup ngrok tunnel
    if os.getenv("ENABLE_TUNNEL", "false").lower() == "true":
        auth_token = "368XYEcgc3sclIeN89z2Ci6rRRv_4we9N38Hs9qd86BUuJES8"
        if auth_token:
            ngrok.set_auth_token(auth_token)
            tunnel = ngrok.connect(port, bind_tls=True)
            public_url = tunnel.public_url
            print(f"🌐 Tunnel URL: {public_url}")
        else:
            print("⚠️ NGROK_AUTH_TOKEN not found. Tunnel might fail.")
            public_url = os.getenv("PUBLIC_URL", f"http://localhost:{port}")
    else:
        public_url = os.getenv("PUBLIC_URL", f"http://localhost:{port}")
    
    # Initialize NANDA agent
    nanda = NANDA(
        agent_id=os.getenv("AGENT_ID", "facta-ai-agent"),
        agent_logic=agent_logic,  # Your custom function
        port=port,
        public_url=public_url,
        registry_url=os.getenv("REGISTRY_URL", "https://mumbaihacksindex.chat39.com"),
        enable_telemetry=True
    )
    
    print(f"🤖 Agent '{os.getenv('AGENT_ID')}' ready!")
    print(f"📡 Listening on port {port}")
    print(f"🔗 Backend Target: {FACTA_BACKEND_URL}")
    
    # Start the agent server
    nanda.start()
