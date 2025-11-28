import Link from 'next/link';
import type { Job } from '@/types/analysis';

interface NewsCardProps {
    analysis: Job;
}

export default function NewsCard({ analysis }: NewsCardProps) {
    const sourceCount = analysis.result?.sources?.length || 0;

    return (
        <Link href={`/chat/${analysis.id}`}>
            <div className="bg-background rounded-lg p-6 hover:bg-background/80 transition-colors cursor-pointer">
                <h3 className="text-lg font-bold mb-2">
                    {analysis.result?.title || 'Analysis Result'}
                </h3>
                <p className="text-secondary mb-4 text-sm leading-relaxed line-clamp-3">
                    {analysis.result?.description || analysis.scrapedText || 'No description available'}
                </p>
                <div className="flex justify-end">
                    <span className="text-xs font-medium bg-surface text-secondary px-3 py-1.5 rounded-full">
                        {sourceCount > 0 ? `${sourceCount}${sourceCount >= 12 ? '+' : ''} source${sourceCount !== 1 ? 's' : ''}` : 'No sources'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
