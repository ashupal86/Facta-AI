# 🚀 Facta AI - Autonomous Fact-Checking Ecosystem

> **"Truth at the Speed of AI"**

Facta AI is a production-ready, multi-agent system designed to verify claims, debunk misinformation, and generate educational content in real-time. It leverages a sophisticated pipeline of AI agents, neural search, and hybrid caching to deliver enterprise-grade performance.

---

## 🧠 System Architecture Flowchart

This flowchart illustrates the complete lifecycle of a request, from user input to final verdict and blog generation.

```mermaid
graph TD
    %% Client Layer
    Client[👤 User / Frontend] -->|POST /api/analysis| API[⚡ API Gateway (Express)]

    %% Normalization Layer
    subgraph "1. Ingestion & Normalization"
        API --> NormService[🔄 Normalization Service]
        NormService --> Guardrail{🛡️ Guardrail Agent}
        Guardrail -- "Irrelevant/Spam" --> Reject[❌ Reject Request]
        Guardrail -- "Valid Claim" --> Transform[📝 Query Transformation]
        Transform --> Hash[🔑 Generate SHA256 Hash]
    end

    %% Caching Layer
    subgraph "2. Hybrid Caching Strategy"
        Hash --> RedisCache{⚡ Redis (Hot Cache)}
        RedisCache -- "Hit" --> ReturnCached[✅ Return Cached Verdict]
        RedisCache -- "Miss" --> PineconeCache{🌲 Pinecone (Semantic Cache)}
        PineconeCache -- "High Similarity (>0.95)" --> ReturnCached
        PineconeCache -- "Miss" --> Queue[📥 BullMQ Job Queue]
    end

    %% Processing Layer
    subgraph "3. Autonomous Agent Pipeline (Worker)"
        Queue --> AnalysisWorker[👷 Analysis Worker]
        
        AnalysisWorker --> ExaSearch[🔍 Exa.ai Neural Search]
        ExaSearch -->|Raw Results| EvidenceWorker[📄 Evidence Extraction Agent]
        
        EvidenceWorker -->|Key Facts| CredibilityWorker[🧠 Credibility Analysis Agent]
        CredibilityWorker -->|Score & Logic| VerdictAgent[⚖️ Final Verdict Agent]
        
        VerdictAgent -->|Verdict: True/False| FinalResult[🏁 Final Result]
    end

    %% Storage & Post-Processing
    subgraph "4. Storage & Content Generation"
        FinalResult --> DB[(PostgreSQL)]
        FinalResult --> RedisSave[(Redis Cache)]
        FinalResult --> PineconeSave[(Pinecone Vector DB)]
        
        FinalResult --> BlogTrigger[⚡ Trigger Background Blog]
        BlogTrigger -.-> BlogService[✍️ Blog Service]
        
        BlogService --> GeminiMeta[🤖 Gemini (Metadata)]
        BlogService --> GeminiContent[🤖 Gemini (Long-form Content)]
        
        GeminiContent --> BlogDB[(Postgres Blog Table)]
        GeminiContent --> BlogVector[(Pinecone Blog Index)]
    end

    ReturnCached --> Client
    FinalResult --> Client
```

---

## ✨ Comprehensive Feature List

### 1. 🛡️ Intelligent Ingestion & Guardrails
*   **Guardrail Agent (`guardrail.agent.ts`)**: Uses Gemini Flash to instantly analyze user intent. Rejects spam, greetings, or irrelevant queries (e.g., "Write code for me") to save costs.
*   **Query Transformation (`query-transform.ts`)**: Rewrites ambiguous user queries into precise, search-optimized statements (e.g., "moon landing fake?" -> "Was the 1969 moon landing faked?").
*   **Claim Hashing**: Generates a unique SHA256 hash for every normalized claim to ensure consistent caching.

### 2. ⚡ Hybrid Caching System
*   **L1: Redis Hot Cache**: Instant O(1) retrieval for exact repeated queries.
*   **L2: Pinecone Semantic Cache**: Uses vector embeddings to detect if a new query is semantically identical to a previously checked claim (e.g., "Earth is flat" vs "Flat earth theory").

### 3. 🔍 Deep Research Engine
*   **Exa.ai Integration (`exa.service.ts`)**: Performs neural web searches that understand context.
*   **Smart Filtering**: Automatically filters out low-quality sources and prioritizes high-authority news and academic domains.
*   **Evidence Extraction (`evidence.worker.ts`)**: An AI worker parses search results to extract only the most relevant sentences and facts, discarding noise.

### 4. 🧠 Multi-Agent Analysis Pipeline
*   **Credibility Worker (`credibility.worker.ts`)**: Analyzes the extracted evidence for bias, logical fallacies, and source reliability. Assigns a numerical credibility score (0-100).
*   **Verdict Agent (`verdict.agent.ts`)**: The "Judge". Synthesizes the claim, evidence, and credibility score to render a final verdict: **True**, **False**, **Misleading**, or **Unverified**.

### 5. ✍️ Automated Journalism (The "Blog System")
*   **Background Generation**: Decoupled from the main fact-check to ensure low latency. Runs silently in the background.
*   **AI Content Creation (`blog.service.ts`)**:
    *   **Metadata Generator**: Creates click-worthy titles, summaries, and highlights.
    *   **Long-Form Writer**: Drafts 2000+ word articles with structured headers, introductions, and conclusions.
*   **Dual Storage**:
    *   **Postgres**: Stores metadata and full text for traditional CMS access.
    *   **Pinecone**: Stores vector embeddings of the blog for semantic search and RAG (Retrieval-Augmented Generation).

### 6. 🏗️ Robust Infrastructure
*   **BullMQ Job Queue**: Handles high-throughput workloads with retries, backoff strategies, and priority management.
*   **PostgreSQL**: Relational source of truth for Users, Analysis Jobs, and Blog Posts.
*   **Dockerized**: Fully containerized environment for easy deployment and scalability.

---

## 🛠️ Technical Stack Breakdown

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Node.js** | Event-driven, non-blocking I/O. |
| **Framework** | **Express.js** | Minimalist web framework for API routes. |
| **Language** | **TypeScript** | Static typing for reliability and maintainability. |
| **LLM** | **Google Gemini 2.0 Flash** | The core intelligence engine. |
| **Search** | **Exa.ai** | Neural search API for factual grounding. |
| **Vector DB** | **Pinecone** | Semantic search and caching. |
| **Queue** | **BullMQ** | Redis-based job queue for async processing. |
| **Cache** | **Redis** | In-memory key-value store. |
| **Database** | **PostgreSQL** | Primary relational database. |

---

## 🚀 API Endpoints

### Analysis
*   `POST /api/analysis`: Submit a claim for async processing (returns Job ID).
*   `POST /api/analysis/sync`: Submit a claim and wait for the result (Synchronous).
*   `GET /api/analysis/:id`: Check job status or get result.

### Blog
*   `POST /blog/generate`: Manually trigger blog generation.
*   `GET /blog/list`: Get a list of all generated blogs.
*   `GET /blog/:id`: Get full content of a specific blog.

### System
*   `GET /api/health`: Check system health (DB, Redis, Queue).
*   `GET /api/queue/stats`: Monitor queue metrics.

---

**Facta AI** is not just a chatbot; it's a comprehensive **Truth Engine**.
