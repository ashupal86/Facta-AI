export interface AnalysisJobData {
    userId?: string;
    input?: string; // User's raw input
    inputType?: 'url' | 'text';
    url?: string;
    text?: string;
    dbJobId?: string; // Database job ID for tracking
    jobId?: string; // BullMQ Job ID

    // Fields from my previous implementation to ensure compatibility
    claim?: string;
    normalizedClaim?: string;
    category?: string;
    keywords?: string[];
    question?: string;
    claimHash?: string;
}

export interface AnalysisJobResult {
    jobId: number | string;
    status: 'completed' | 'failed';
    result?: any; // Flexible result type to accommodate my pipeline output
    error?: string;
    scrapedText?: string;
}

export interface QueueJobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: {
        type: 'exponential' | 'fixed';
        delay: number;
    };
}

export enum JobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface JobProgress {
    jobId: number | string;
    status: JobStatus;
    progress: number; // 0-100
    currentStep: string;
    estimatedTimeRemaining?: number; // in seconds
}
