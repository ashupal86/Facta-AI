/**
 * Example usage of the database repositories
 * This file demonstrates how to use the User and AnalysisJob repositories
 */

import { UserRepository } from '../repositories/user.repository.js';
import { AnalysisJobRepository } from '../repositories/analysis-job.repository.js';
import { JobStatus, Category } from '../types/database.js';
import { randomUUID } from 'crypto';

export async function exampleUsage() {
    try {
        // Create a new user with a unique email
        const uniqueId = randomUUID();
        const email = `user_${Date.now()}@example.com`;

        const newUser = await UserRepository.create({
            id: uniqueId,
            email: email,
        });
        console.log('Created user:', newUser);

        // Find user by email
        const foundUser = await UserRepository.findByEmail(email);
        console.log('Found user:', foundUser);

        // Create an analysis job for the user
        const newJob = await AnalysisJobRepository.create({
            id: randomUUID(),
            input: 'Sample claim to analyze',
            userId: newUser.id,
            status: JobStatus.PENDING,
            category: Category.TECHNOLOGY,
        });
        console.log('Created analysis job:', newJob);

        // Update the job status
        const updatedJob = await AnalysisJobRepository.update(newJob.id, {
            status: JobStatus.RUNNING,
            scrapedText: 'Some scraped content...',
        });
        console.log('Updated job:', updatedJob);

        // Get all jobs for a user
        const userJobs = await AnalysisJobRepository.findByUserId(newUser.id);
        console.log('User jobs:', userJobs);

        // Get job with user information
        const jobWithUser = await AnalysisJobRepository.findByIdWithUser(newJob.id);
        console.log('Job with user:', jobWithUser);

        // Get user with all their jobs
        const userWithJobs = await UserRepository.findByIdWithJobs(newUser.id);
        console.log('User with jobs:', userWithJobs);

        // Count pending jobs for user
        const pendingCount = await AnalysisJobRepository.countByStatusForUser(
            newUser.id,
            JobStatus.PENDING
        );
        console.log('Pending jobs count:', pendingCount);

        process.exit(0);
    } catch (error) {
        console.error('Error in example usage:', error);
        process.exit(1);
    }
}

// Execute the example
// exampleUsage();
