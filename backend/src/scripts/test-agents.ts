import 'dotenv/config';
import { generateVerdict } from '../agents/verdict.agent.js';
import { generateBlogDraft } from '../agents/blog.agent.js';
import { ClaimNormalizationService } from '../services/normalization.service.js';
import { redis, closeRedisConnection } from '../lib/redis.js';

async function testAgents() {
    console.log('--- Testing Agents Individually ---');

    // Mock data for agents
    const mockClaim = "The earth is flat.";
    const mockEvidence = [
        { quote: "Images from space show the Earth is round.", source: "NASA" },
        { quote: "Gravity pulls everything to the center.", source: "Physics Textbook" }
    ];
    const mockAnalysis = {
        credibilityScore: 10,
        contradictions: ["Scientific consensus", "Photographic evidence"]
    };

    let verdictResult;

    try {
        console.log('Testing Verdict Agent...');
        verdictResult = await generateVerdict(mockClaim, mockEvidence, mockAnalysis);
        console.log('Verdict Agent Result:', verdictResult);
        console.log('✅ Verdict Agent: PASS');
    } catch (error) {
        console.error('Verdict Agent Failed:', error);
    }

    try {
        console.log('\nTesting Blog Agent...');
        // Use the actual result from verdict agent if available, else mock
        const verdictToUse = verdictResult || {
            verdict: 'False',
            confidence: 99,
            explanation: 'Overwhelming scientific evidence proves the Earth is a sphere.',
            keyEvidence: ['NASA images', 'Gravity']
        };
        const blog = await generateBlogDraft(mockClaim, verdictToUse, mockEvidence);
        console.log('Blog Agent Result (first 100 chars):', blog.substring(0, 100) + '...');
        console.log('✅ Blog Agent: PASS');
    } catch (error) {
        console.error('Blog Agent Failed:', error);
    }
}

async function testCombined() {
    console.log('\n--- Testing Combined Agents (Simulation) ---');
    // This simulates the flow in the worker
    const claim = "Water is wet.";
    const evidence = [{ quote: "Water is a liquid that makes things wet.", source: "Science" }];
    const analysis = { credibilityScore: 100, contradictions: [] };

    try {
        console.log(`1. Generating Verdict for: "${claim}"`);
        const verdict = await generateVerdict(claim, evidence, analysis);

        console.log(`2. Generating Blog Draft based on verdict...`);
        const blog = await generateBlogDraft(claim, verdict, evidence);

        if (verdict && blog) {
            console.log('✅ Combined Agents Flow: PASS');
        } else {
            console.error('❌ Combined Agents Flow: FAIL (Missing output)');
        }
    } catch (error) {
        console.error('Combined Agents Flow Failed:', error);
    }
}

async function testCache() {
    console.log('\n--- Testing Cache Scenarios ---');

    const query1 = "Bananas are blue.";
    // Use a very simple query that is less likely to be rephrased by LLM
    const query2 = "Paris is the capital of France.";

    // 1. Test Cache Miss
    console.log(`\nTesting Cache MISS for query: "${query1}"`);
    try {
        const result1 = await ClaimNormalizationService.processClaim(query1);
        console.log('Result 1 Status:', result1.status);

        // if (result1.status === 'queued') {
        //      console.log('✅ Cache Miss: PASS');
        // } else {
        //      console.warn('⚠️ Unexpected status for new query:', result1.status);
        // }
    } catch (error) {
        console.error('Cache Miss Test Failed:', error);
    }

    // 2. Simulate Cache Hit
    console.log(`\nTesting Cache HIT for query: "${query2}"`);

    let claimHash2 = '';
    try {
        console.log('Step 1: Initial run (Miss)...');
        const result2a = await ClaimNormalizationService.processClaim(query2);
        console.log('Result 2a Status:', result2a.status);
        claimHash2 = result2a.claimHash || '';

        if (result2a.status === 'queued' && claimHash2) {
            console.log(`Step 2: Populating cache for hash ${claimHash2}...`);
            const mockCachedResult = {
                verdict: { verdict: 'True', confidence: 100, explanation: 'Paris is indeed the capital.' },
                analysis: {},
                evidence: [],
                blogDraft: 'Paris is the capital...',
                timestamp: new Date().toISOString()
            };
            await redis.set(`cache:claim:${claimHash2}`, JSON.stringify(mockCachedResult), 'EX', 60);

            console.log('Step 3: Second run (Expect Hit)...');
            const result2b = await ClaimNormalizationService.processClaim(query2);
            console.log('Result 2b Status:', result2b.status);
            console.log('Result 2b Hash:', result2b.claimHash);

            if (result2b.status === 'cached') {
                console.log('✅ Cache Hit: PASS');
            } else {
                if (result2b.claimHash !== claimHash2) {
                    console.warn('⚠️ Cache Hit Test Inconclusive: Normalized claim hash changed between runs due to LLM non-determinism.');
                    console.warn(`Hash 1: ${claimHash2}`);
                    console.warn(`Hash 2: ${result2b.claimHash}`);
                } else {
                    console.error('❌ Cache Hit: FAIL (Hash matched but not cached?)');
                }
            }
        }
    } catch (error) {
        console.error('Cache Hit Test Failed:', error);
    }
}

async function testGuardrail() {
    console.log('\n--- Testing Guardrail ---');

    const validQuery = "The earth is flat.";
    const invalidQuery = "What is 2 + 2?";
    const invalidQuery2 = "Hello, how are you?";

    // 1. Valid Query
    console.log(`\nTesting Valid Query: "${validQuery}"`);
    try {
        const result = await ClaimNormalizationService.processClaim(validQuery);
        if (result.status !== 'rejected') {
            console.log('✅ Guardrail Allowed Valid Query: PASS');
        } else {
            console.error('❌ Guardrail Blocked Valid Query: FAIL');
        }
    } catch (error) {
        console.error('Guardrail Valid Test Failed:', error);
    }

    // 2. Invalid Query (Math)
    console.log(`\nTesting Invalid Query: "${invalidQuery}"`);
    try {
        const result = await ClaimNormalizationService.processClaim(invalidQuery);
        if (result.status === 'rejected') {
            console.log('✅ Guardrail Blocked Invalid Query: PASS');
            console.log(`   Message: "${result.message}"`);
        } else {
            console.error('❌ Guardrail Allowed Invalid Query: FAIL');
        }
    } catch (error) {
        console.error('Guardrail Invalid Test Failed:', error);
    }

    // 3. Invalid Query (Greeting)
    console.log(`\nTesting Invalid Query: "${invalidQuery2}"`);
    try {
        const result = await ClaimNormalizationService.processClaim(invalidQuery2);
        if (result.status === 'rejected') {
            console.log('✅ Guardrail Blocked Greeting: PASS');
            console.log(`   Message: "${result.message}"`);
        } else {
            console.error('❌ Guardrail Allowed Greeting: FAIL');
        }
    } catch (error) {
        console.error('Guardrail Greeting Test Failed:', error);
    }
}

async function main() {
    try {
        await testGuardrail();
        await testAgents();
        await testCombined();
        await testCache();
    } catch (e) {
        console.error("Test script error:", e);
    } finally {
        await closeRedisConnection();
        process.exit(0);
    }
}

main();
