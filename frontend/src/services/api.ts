import axios from 'axios';

const API_URL = 'http://localhost:4000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface AnalysisResult {
    id: string;
    claim: string;
    verdict: 'True' | 'False' | 'Misleading' | 'Unverified';
    confidence: number;
    analysis: string;
    evidence: Array<{
        text: string;
        source: string;
        url: string;
    }>;
}

export interface Blog {
    id: string;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
}

export const analyzeClaim = async (claim: string): Promise<AnalysisResult> => {
    // Using the sync endpoint for immediate results as per user request for "input and output"
    const response = await api.post('/api/analysis/sync', { claim });
    return response.data;
};

export const getBlogs = async (): Promise<Blog[]> => {
    const response = await api.get('/blog/list');
    return response.data;
};

export const getBlogById = async (id: string): Promise<Blog> => {
    const response = await api.get(`/blog/${id}`);
    return response.data;
};

export default api;
