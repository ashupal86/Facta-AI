FROM python:3.10-slim

WORKDIR /app

# Install git for git dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port
EXPOSE 7000

# Use a shell command to construct the full URL from the base URL provided by Render
CMD ["sh", "-c", "export FACTA_BACKEND_URL=${FACTA_BACKEND_BASE_URL}/api/analysis/sync && python agent.py"]
