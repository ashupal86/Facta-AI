// Enums
export enum Category {
    POLITICS_GOVERNANCE = 'POLITICS_GOVERNANCE',
    CONFLICT_SECURITY = 'CONFLICT_SECURITY',
    BUSINESS_ECONOMY = 'BUSINESS_ECONOMY',
    TECHNOLOGY = 'TECHNOLOGY',
    SCIENCE = 'SCIENCE',
    HEALTH_WELLNESS = 'HEALTH_WELLNESS',
    ENVIRONMENT_CLIMATE = 'ENVIRONMENT_CLIMATE',
    SPORTS = 'SPORTS',
    ARTS_CULTURE = 'ARTS_CULTURE',
    SOCIETY_HUMAN_INTEREST = 'SOCIETY_HUMAN_INTEREST',
    OTHER = 'OTHER',
}

export enum JobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

// Database Models
export interface User {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalysisJob {
    id: string;
    queueJobId: string | null;
    status: JobStatus;
    input: string;
    scrapedText: string | null;
    category: Category | null;
    result: any | null; // JSONB type
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

// Input types for creating records
export interface CreateUserInput {
    id: string;
    email: string;
}

export interface CreateAnalysisJobInput {
    id: string;
    input: string;
    userId: string;
    queueJobId?: string;
    status?: JobStatus;
    scrapedText?: string;
    category?: Category;
    result?: any;
}

// Update types
export interface UpdateUserInput {
    email?: string;
    updatedAt?: Date;
}

export interface UpdateAnalysisJobInput {
    queueJobId?: string;
    status?: JobStatus;
    scrapedText?: string;
    category?: Category;
    result?: any;
    updatedAt?: Date;
}

// Extended types with relations
export interface UserWithJobs extends User {
    analysisJobs: AnalysisJob[];
}

export interface AnalysisJobWithUser extends AnalysisJob {
    user: User;
}
