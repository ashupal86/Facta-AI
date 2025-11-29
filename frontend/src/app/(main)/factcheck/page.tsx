'use client';

import FactCheckForm from '@/components/FactCheckForm';
import MaterialIcon from '@/components/common/material-icon';

export default function FactCheckPage() {
    return (
        <section className="flex-1 overflow-y-auto space-y-6 pt-6 pr-2 -mr-2">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <MaterialIcon icon="fact_check" className="text-3xl text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Fact-Check Analysis</h1>
                    <p className="text-secondary">
                        Submit any claim or statement to verify its accuracy with AI-powered fact-checking
                    </p>
                </div>

                {/* Form */}
                <div className="bg-background rounded-xl p-6 shadow-sm">
                    <FactCheckForm />
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-surface rounded-lg p-4">
                        <MaterialIcon icon="search" className="text-2xl text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Deep Research</h3>
                        <p className="text-sm text-secondary">
                            Searches multiple sources to verify claims
                        </p>
                    </div>
                    <div className="bg-surface rounded-lg p-4">
                        <MaterialIcon icon="psychology" className="text-2xl text-primary mb-2" />
                        <h3 className="font-semibold mb-1">AI Analysis</h3>
                        <p className="text-sm text-secondary">
                            Uses advanced AI to analyze credibility
                        </p>
                    </div>
                    <div className="bg-surface rounded-lg p-4">
                        <MaterialIcon icon="verified" className="text-2xl text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Source Citations</h3>
                        <p className="text-sm text-secondary">
                            Provides sources for transparency
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
