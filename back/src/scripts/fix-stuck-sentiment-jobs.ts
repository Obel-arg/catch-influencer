/**
 * Script to fix stuck sentiment analysis jobs
 * This will:
 * 1. Reset stuck jobs (processing for too long)
 * 2. Retry failed jobs
 * 3. Clean up orphaned jobs
 */

import { PostgresQueueService } from '../services/queues/postgres-queue.service';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixStuckSentimentJobs() {
  console.log('🔧 Sentiment Analysis Job Fixer\n');

  const queueService = PostgresQueueService.getInstance();

  try {
    // 1. Check current status
    const stats = await queueService.getQueueStats('sentiment-analysis');
    console.log('📊 Current Queue Stats:');
    console.log(`   - Pending: ${stats.pending}`);
    console.log(`   - Processing: ${stats.processing}`);
    console.log(`   - Failed: ${stats.failed}`);
    console.log(`   - Total: ${stats.total}\n`);

    // 2. Find stuck jobs
    console.log('🔍 Looking for stuck jobs (processing for more than 3 minutes)...');
    const stuckJobs = await queueService.getStuckJobs('sentiment-analysis', 3);

    if (stuckJobs.length > 0) {
      console.log(`⚠️  Found ${stuckJobs.length} stuck job(s)\n`);

      const answer = await question('Do you want to restart these stuck jobs? (yes/no): ');

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('🔄 Restarting stuck jobs...');
        let restartedCount = 0;

        for (const job of stuckJobs) {
          try {
            await queueService.restartJob(job.id);
            restartedCount++;
            console.log(`   ✅ Restarted job ${job.id}`);
          } catch (error) {
            console.error(`   ❌ Failed to restart job ${job.id}:`, error);
          }
        }

        console.log(`\n✅ Restarted ${restartedCount}/${stuckJobs.length} stuck jobs\n`);
      } else {
        console.log('⏭️  Skipping stuck jobs restart\n');
      }
    } else {
      console.log('✅ No stuck jobs found\n');
    }

    // 3. Find and retry failed jobs
    console.log('🔍 Looking for failed jobs that can be retried...');
    const failedJobs = await queueService.getJobsNeedingRetry('sentiment-analysis');

    if (failedJobs.length > 0) {
      console.log(`⚠️  Found ${failedJobs.length} failed job(s) that can be retried\n`);

      const answer = await question('Do you want to retry these failed jobs? (yes/no): ');

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('🔄 Retrying failed jobs...');
        const retriedCount = await queueService.retryFailedJobs('sentiment-analysis');
        console.log(`\n✅ Retried ${retriedCount} failed job(s)\n`);
      } else {
        console.log('⏭️  Skipping failed jobs retry\n');
      }
    } else {
      console.log('✅ No failed jobs need retry\n');
    }

    // 4. Show updated stats
    const updatedStats = await queueService.getQueueStats('sentiment-analysis');
    console.log('📊 Updated Queue Stats:');
    console.log(`   - Pending: ${updatedStats.pending}`);
    console.log(`   - Processing: ${updatedStats.processing}`);
    console.log(`   - Failed: ${updatedStats.failed}`);
    console.log(`   - Total: ${updatedStats.total}\n`);

    console.log('✅ Fix complete!\n');
    console.log('💡 Note: The worker will automatically process the pending jobs.');
    console.log('   Check the worker logs to see progress.\n');

  } catch (error) {
    console.error('❌ Error fixing sentiment jobs:', error);
  }

  rl.close();
  process.exit(0);
}

// Run the fixer
fixStuckSentimentJobs();
