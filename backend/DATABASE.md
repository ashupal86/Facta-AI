# Database Setup Guide

This guide explains how to set up and use the PostgreSQL database for the Facta-AI backend.

## Prerequisites

- Docker and Docker Compose (already running)
- Node.js and npm
- PostgreSQL running in Docker (configured in `docker-compose.yml`)

## Database Configuration

The database connection is configured via the `DATABASE_URL` environment variable in your `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/Facta-AI
```

## Setup Steps

### 1. Install Dependencies

First, ensure you've installed the `pg` package:

```bash
npm install
```

### 2. Run the Migration

Execute the migration to create the database tables:

```bash
npm run migrate
```

This will create:
- **Enums**: `Category` and `JobStatus`
- **Tables**: `User` and `AnalysisJob`
- **Indexes**: On `userId` and `category` for the `AnalysisJob` table
- **Foreign Keys**: Linking `AnalysisJob` to `User`

## Database Schema

### User Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| email | TEXT | Unique email address |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### AnalysisJob Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| queueJobId | TEXT | Optional queue job identifier |
| status | JobStatus | Job status (PENDING, RUNNING, COMPLETED, FAILED) |
| input | TEXT | Input claim/text to analyze |
| scrapedText | TEXT | Scraped content from sources |
| category | Category | Content category |
| result | JSONB | Analysis results (JSON) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |
| userId | TEXT | Foreign key to User table |

### Enums

**Category**:
- POLITICS_GOVERNANCE
- CONFLICT_SECURITY
- BUSINESS_ECONOMY
- TECHNOLOGY
- SCIENCE
- HEALTH_WELLNESS
- ENVIRONMENT_CLIMATE
- SPORTS
- ARTS_CULTURE
- SOCIETY_HUMAN_INTEREST
- OTHER

**JobStatus**:
- PENDING
- RUNNING
- COMPLETED
- FAILED

## Usage

### Database Client

The database client is located at `src/lib/db.ts` and provides:

```typescript
import db from './lib/db.js';

// Execute a query
const result = await db.query('SELECT * FROM "public"."User"');

// Execute a transaction
await db.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});

// Close the pool (for graceful shutdown)
await db.closePool();
```

### Repositories

Use the repository classes for type-safe database operations:

#### User Repository

```typescript
import { UserRepository } from './repositories/user.repository.js';
import { randomUUID } from 'crypto';

// Create a user
const user = await UserRepository.create({
  id: randomUUID(),
  email: 'user@example.com',
});

// Find by ID
const user = await UserRepository.findById(userId);

// Find by email
const user = await UserRepository.findByEmail('user@example.com');

// Update user
await UserRepository.update(userId, { email: 'newemail@example.com' });

// Get user with their jobs
const userWithJobs = await UserRepository.findByIdWithJobs(userId);
```

#### AnalysisJob Repository

```typescript
import { AnalysisJobRepository } from './repositories/analysis-job.repository.js';
import { JobStatus, Category } from './types/database.js';
import { randomUUID } from 'crypto';

// Create a job
const job = await AnalysisJobRepository.create({
  id: randomUUID(),
  input: 'Claim to fact-check',
  userId: userId,
  status: JobStatus.PENDING,
  category: Category.TECHNOLOGY,
});

// Update job
await AnalysisJobRepository.update(jobId, {
  status: JobStatus.RUNNING,
  scrapedText: 'Scraped content...',
  result: { verdict: 'true', confidence: 0.95 },
});

// Find jobs by user
const jobs = await AnalysisJobRepository.findByUserId(userId);

// Find jobs by status
const pendingJobs = await AnalysisJobRepository.findByStatus(JobStatus.PENDING);

// Find jobs by category
const techJobs = await AnalysisJobRepository.findByCategory(Category.TECHNOLOGY);

// Get job with user info
const jobWithUser = await AnalysisJobRepository.findByIdWithUser(jobId);
```

## File Structure

```
backend/
├── migrations/
│   └── 001_initial_schema.sql    # Database migration SQL
├── src/
│   ├── lib/
│   │   └── db.ts                 # Database client
│   ├── types/
│   │   └── database.ts           # TypeScript types
│   ├── repositories/
│   │   ├── user.repository.ts    # User CRUD operations
│   │   └── analysis-job.repository.ts  # AnalysisJob CRUD operations
│   ├── scripts/
│   │   └── migrate.ts            # Migration runner
│   └── examples/
│       └── database-usage.ts     # Usage examples
└── package.json
```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Ensure Docker containers are running:
   ```bash
   docker compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker compose logs postgres
   ```

3. Verify the `DATABASE_URL` in your `.env` file matches your docker-compose configuration

### Migration Errors

If the migration fails with "already exists" errors, the tables are already created. You can:

1. Drop the existing tables:
   ```sql
   DROP TABLE IF EXISTS "public"."AnalysisJob" CASCADE;
   DROP TABLE IF EXISTS "public"."User" CASCADE;
   DROP TYPE IF EXISTS "public"."Category" CASCADE;
   DROP TYPE IF EXISTS "public"."JobStatus" CASCADE;
   ```

2. Re-run the migration:
   ```bash
   npm run migrate
   ```

## Next Steps

1. Integrate the repositories into your application logic
2. Add error handling and validation
3. Consider adding database indexes for performance
4. Implement connection pooling limits based on your needs
5. Add database backup and recovery procedures
