import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface AnalysisResult {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
        truthScore: number;
        verdict: string;
        explanation: string;
        sources: string[];
    };
}

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    imageUrl?: string;
}
