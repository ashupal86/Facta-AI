import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import analysisRoutes from './routes/analysis.routes.js';
import blogRoutes from './routes/blog.routes.js';
import { QueueService, WorkerService, startAutoScaling, startMonitoring } from './services/queue.js';
import { checkRedisHealth, getRedisStatus, closeRedisConnection } from './lib/redis.js';
import { transformQuery } from './services/query-transform.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/analyze', analysisRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/blog', blogRoutes); // User used this prefix, keeping both for now or sticking to one. 
// My previous test used /analyze. I'll map /api/analysis to the same routes for compatibility.
app.use('/api/analysis', analysisRoutes);

// Legacy/Direct endpoints
app.post('/api/query-transform', async (req, res) => {
    try {
        const { query } = req.body;
        const result = await transformQuery(query);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', async (req, res) => {
    const redisHealthy = await checkRedisHealth();
    const queueHealth = await QueueService.getHealthStatus();

    res.json({
        status: redisHealthy && queueHealth.status === 'healthy' ? 'ok' : 'degraded',
        redis: redisHealthy ? 'connected' : 'disconnected',
        queue: queueHealth
    });
});

app.get('/api/health', async (req, res) => {
    const redisHealthy = await checkRedisHealth();
    const queueHealth = await QueueService.getHealthStatus();

    res.json({
        status: redisHealthy && queueHealth.status === 'healthy' ? 'ok' : 'degraded',
        redis: redisHealthy ? 'connected' : 'disconnected',
        queue: queueHealth
    });
});

// Queue Management & Monitoring Endpoints
app.get('/api/queue/stats', async (req, res) => {
    try {
        const stats = await QueueService.getQueueStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get queue stats' });
    }
});

app.get('/api/monitoring/dashboard', async (req, res) => {
    try {
        const [health, stats, metrics, redisStatus] = await Promise.all([
            QueueService.getHealthStatus(),
            QueueService.getQueueStats(),
            QueueService.getPerformanceMetrics(),
            getRedisStatus()
        ]);

        res.json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                redis: redisStatus,
                queue: { health, stats, metrics }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get dashboard' });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Facta AI Server is running on port ${PORT} `);

    // Initialize monitoring and auto-scaling
    try {
        startMonitoring();
        startAutoScaling();
        console.log(`🔄 Auto - scaling and monitoring started`);

        // Auto-start the integrated worker
        await WorkerService.startWorker();
        console.log("✅ Integrated worker started automatically");
    } catch (error) {
        console.error("❌ Failed to start monitoring or worker:", error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down server...');
    await WorkerService.stopWorker();
    await QueueService.shutdown();
    await closeRedisConnection();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Shutting down server...');
    await WorkerService.stopWorker();
    await QueueService.shutdown();
    await closeRedisConnection();
    process.exit(0);
});
