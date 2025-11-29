'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApi } from '@/helpers/api';
import { apiEndPoints } from '@/helpers/apiEndpoints';
import type { Job } from '@/types/analysis';
import NewsCard from '@/components/NewsCard';
import MaterialIcon from '@/components/common/material-icon';

export default function Home() {
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      // Use the jobs endpoint with userId
      const response = await getApi(apiEndPoints.analysis.jobs(user.id));

      if (response.status !== 200) {
        // If 404, it might just mean no jobs yet, or endpoint not ready. 
        // But let's assume 404 means error for now unless we know otherwise.
        // Actually, if the backend returns 404 for no jobs, we should handle it.
        // But usually list endpoints return empty array.
        console.error("Failed to fetch jobs:", response);
        setError('Failed to fetch analysis history');
        setLoading(false);
        return;
      }

      if (response.data) {
        // Check if response.data is the array directly or if it's wrapped
        // Backend usually returns JSON. If it's a list of jobs, it might be response.data directly or response.data.data
        // Let's inspect the backend response structure for /jobs/:userId if possible.
        // Since I can't see the backend code for that specific route right now (it wasn't in the file view),
        // I'll assume a standard wrapper or array. 
        // The previous code expected response.data.data.jobs.
        // Let's stick to a safe check.
        const jobsData = response.data.data || response.data;
        if (Array.isArray(jobsData)) {
          setAnalysis(jobsData);
        } else if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
          setAnalysis(jobsData.jobs);
        } else {
          setAnalysis([]);
        }
      } else {
        setAnalysis([]);
      }
      setLoading(false);
    };

    fetchAnalysis();
  }, [user?.id]);

  return (
    <section className="flex-1 overflow-y-auto space-y-4 pt-6 pr-2 -mr-2">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <MaterialIcon icon="progress_activity" className="text-4xl text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-background rounded-lg p-6 text-center">
          <MaterialIcon icon="error" className="text-4xl text-destructive mb-2" />
          <p className="text-secondary">{error}</p>
        </div>
      ) : analysis.length === 0 ? (
        <div className="bg-background rounded-lg p-12 text-center">
          <MaterialIcon icon="article" className="text-6xl text-secondary mb-4" />
          <h3 className="text-xl font-bold mb-2">No Updates Yet</h3>
          <p className="text-secondary mb-6">
            Start analyzing content to see your fact-check updates here
          </p>
          {user && (
            <a
              href="/chat/new"
              className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MaterialIcon icon="add" />
              Create New Analysis
            </a>
          )}
        </div>
      ) : (
        analysis.map((job) => <NewsCard key={job.id} analysis={job} />)
      )}
    </section>
  );
}
