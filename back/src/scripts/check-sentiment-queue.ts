/**
 * Script to check the status of sentiment analysis jobs in the queue
 * This helps diagnose why analysis might be stuck in "Análisis en progreso"
 */

import { PostgresQueueService } from '../services/queues/postgres-queue.service';
import supabase from '../config/supabase';

async function checkSentimentQueue() {
  console.log('🔍 Checking sentiment analysis queue status...\n');

  const queueService = PostgresQueueService.getInstance();

  try {
    // 1. Get overall queue stats
    const stats = await queueService.getQueueStats('sentiment-analysis');
    console.log('📊 Overall Queue Stats:');
    console.log(`   - Pending: ${stats.pending}`);
    console.log(`   - Processing: ${stats.processing}`);
    console.log(`   - Completed: ${stats.completed}`);
    console.log(`   - Failed: ${stats.failed}`);
    console.log(`   - Total: ${stats.total}\n`);

    // 2. Get active jobs (pending + processing)
    const activeJobs = await queueService.getActiveJobs('sentiment-analysis');
    if (activeJobs.length > 0) {
      console.log(`📋 Active Jobs (${activeJobs.length}):`);
      activeJobs.forEach((job, index) => {
        const jobData = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
        const timeSinceCreated = Date.now() - new Date(job.created_at).getTime();
        const minutesAgo = Math.floor(timeSinceCreated / 1000 / 60);

        console.log(`   ${index + 1}. Job ${job.id}`);
        console.log(`      Status: ${job.status}`);
        console.log(`      Post ID: ${jobData.postId}`);
        console.log(`      Comments: ${jobData.comments?.length || 0}`);
        console.log(`      Last Batch: ${jobData.isLastBatch ? 'Yes' : 'No'}`);
        console.log(`      Created: ${minutesAgo} minutes ago`);
        console.log(`      Attempts: ${job.attempts}/${job.max_attempts}\n`);
      });
    } else {
      console.log('✅ No active jobs in queue\n');
    }

    // 3. Get stuck jobs (processing for too long)
    const stuckJobs = await queueService.getStuckJobs('sentiment-analysis', 5); // 5 minutes
    if (stuckJobs.length > 0) {
      console.log(`⚠️  Stuck Jobs (${stuckJobs.length}) - Processing for more than 5 minutes:`);
      stuckJobs.forEach((job, index) => {
        const jobData = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
        const timeSinceStarted = job.started_at
          ? Date.now() - new Date(job.started_at).getTime()
          : 0;
        const minutesStuck = Math.floor(timeSinceStarted / 1000 / 60);

        console.log(`   ${index + 1}. Job ${job.id}`);
        console.log(`      Post ID: ${jobData.postId}`);
        console.log(`      Stuck for: ${minutesStuck} minutes`);
        console.log(`      Error: ${job.error || 'None'}\n`);
      });
    } else {
      console.log('✅ No stuck jobs\n');
    }

    // 4. Get failed jobs
    const failedJobs = await queueService.getFailedJobs('sentiment-analysis', 10);
    if (failedJobs.length > 0) {
      console.log(`❌ Recent Failed Jobs (${failedJobs.length}):`);
      failedJobs.forEach((job, index) => {
        const jobData = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;

        console.log(`   ${index + 1}. Job ${job.id}`);
        console.log(`      Post ID: ${jobData.postId}`);
        console.log(`      Attempts: ${job.attempts}/${job.max_attempts}`);
        console.log(`      Error: ${job.error || 'Unknown'}\n`);
      });
    } else {
      console.log('✅ No failed jobs\n');
    }

    // 5. Get jobs that need retry
    const jobsNeedingRetry = await queueService.getJobsNeedingRetry('sentiment-analysis');
    if (jobsNeedingRetry.length > 0) {
      console.log(`🔄 Jobs that need retry (${jobsNeedingRetry.length}):`);
      jobsNeedingRetry.forEach((job, index) => {
        const jobData = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
        console.log(`   ${index + 1}. Job ${job.id} - Post: ${jobData.postId}\n`);
      });
    } else {
      console.log('✅ No jobs need retry\n');
    }

    // 6. Check for posts with incomplete sentiment analysis
    const { data: postsWithPendingAnalysis, error } = await supabase
      .from('sentiment_analysis')
      .select('post_id, analyzed_at, total_comments')
      .is('analyzed_at', null)
      .limit(10);

    if (error) {
      console.error('❌ Error checking sentiment_analysis table:', error);
    } else if (postsWithPendingAnalysis && postsWithPendingAnalysis.length > 0) {
      console.log(`🔍 Posts with pending analysis in DB (${postsWithPendingAnalysis.length}):`);
      postsWithPendingAnalysis.forEach((post, index) => {
        console.log(`   ${index + 1}. Post ID: ${post.post_id}`);
        console.log(`      Total Comments: ${post.total_comments || 0}`);
        console.log(`      Analyzed: ${post.analyzed_at || 'Not yet'}\n`);
      });
    } else {
      console.log('✅ No posts with pending analysis in DB\n');
    }

    console.log('✅ Queue check complete!\n');

  } catch (error) {
    console.error('❌ Error checking sentiment queue:', error);
  }

  process.exit(0);
}

// Run the check
checkSentimentQueue();
