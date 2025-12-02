#!/usr/bin/env ts-node

/**
 * CLI Script for Bulk HypeAuditor Report Collection
 *
 * This script collects real HypeAuditor audience reports from ~50 diverse influencers
 * for accurate audience demographic inference. These reports replace synthetic
 * template-based data with real audience demographics.
 *
 * Usage:
 *   npm run collect-reports
 *   or
 *   ts-node src/scripts/collect-audience-reports.ts
 *
 * Cost: ~50 HypeAuditor API queries (~$500 at $10/report)
 */

import { ReportCollectorService } from '../services/hypeauditor/report-collector.service';

/**
 * Strategic collection list - 50 diverse influencers
 *
 * Distribution:
 * - Platforms: Instagram (50%), TikTok (30%), YouTube (20%)
 * - Sizes: Micro (10K-100K), Macro (100K-1M), Mega (1M+)
 * - Niches: Fashion, Tech, Lifestyle, Fitness, Food, Gaming, etc.
 * - Genders: Mix of male/female influencers
 * - Locations: US, UK, Spain, LATAM, Asia
 */
const COLLECTION_LIST = [
  // Fashion/Beauty - Instagram
  { username: 'chiaraferragni', platform: 'instagram' as const },
  { username: 'jamescharles', platform: 'instagram' as const },
  { username: 'huda', platform: 'instagram' as const },

  // Tech/Gaming - YouTube
  { username: 'mkbhd', platform: 'youtube' as const },
  { username: 'ibai', platform: 'youtube' as const },
  { username: 'mrwhosetheboss', platform: 'youtube' as const },

  // Lifestyle/Travel - Mixed
  { username: 'caseyneistat', platform: 'youtube' as const },
  { username: 'kylie jenner', platform: 'instagram' as const },
  { username: 'khaby.lame', platform: 'tiktok' as const },

  // Fitness - Mixed
  { username: 'kayla_itsines', platform: 'instagram' as const },
  { username: 'joe_wicks', platform: 'instagram' as const },

  // Food/Cooking
  { username: 'gordonramsay', platform: 'instagram' as const },
  { username: 'emmachamberlain', platform: 'youtube' as const },

  // Entertainment/Comedy
  { username: 'therock', platform: 'instagram' as const },
  { username: 'kevin hart', platform: 'instagram' as const },

  // Music
  { username: 'billieeilish', platform: 'instagram' as const },
  { username: 'shakira', platform: 'instagram' as const },

  // Sports
  { username: 'cristiano', platform: 'instagram' as const },
  { username: 'leomessi', platform: 'instagram' as const },
  { username: 'neymarjr', platform: 'instagram' as const },

  // TikTok Creators
  { username: 'charlidamelio', platform: 'tiktok' as const },
  { username: 'addisonre', platform: 'tiktok' as const },
  { username: 'bellapoarch', platform: 'tiktok' as const },

  // Add more diverse influencers to reach 50 total
  // TODO: Expand this list with local influencers and specific niches
];

/**
 * Main collection function
 */
async function collectAudienceReports() {
  const collector = new ReportCollectorService();

  console.log('🚀 Starting HypeAuditor Report Collection');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 Target: ${COLLECTION_LIST.length} reports`);
  console.log(`💰 Estimated cost: $${COLLECTION_LIST.length * 10} (${COLLECTION_LIST.length} queries)`);
  console.log('');

  // Get current stats
  const stats = await collector.getCollectionStats();
  console.log('📈 Current collection stats:');
  console.log(`   Total reports: ${stats.total_reports}`);
  console.log(`   By platform:`, stats.by_platform);
  console.log(`   Total API cost: ${stats.total_cost} queries`);
  console.log('');

  // Confirm before proceeding
  console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('\n🎯 Starting collection process...\n');

  // Collect in batches of 10 to manage rate limiting
  const batchSize = 10;
  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < COLLECTION_LIST.length; i += batchSize) {
    const batch = COLLECTION_LIST.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(COLLECTION_LIST.length / batchSize);

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} influencers)`);
    console.log('─────────────────────────────────────────────────────────');

    const results = await collector.collectBatchReports(batch);

    totalSuccess += results.success;
    totalFailed += results.failed;

    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    // List successful collections
    if (results.reports.length > 0) {
      console.log('   📋 Collected reports:');
      results.reports.forEach((report) => {
        console.log(
          `      - ${report.influencer_username} (${report.platform}): ${report.follower_count?.toLocaleString()} followers`
        );
      });
    }

    // Wait between batches to avoid rate limiting (30 seconds)
    if (i + batchSize < COLLECTION_LIST.length) {
      console.log('\n   ⏳ Waiting 30 seconds before next batch...');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }

  // Final stats
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✨ Collection Complete!');
  console.log('═══════════════════════════════════════════════════════════');

  const finalStats = await collector.getCollectionStats();
  console.log(`📊 Final statistics:`);
  console.log(`   Total reports in database: ${finalStats.total_reports}`);
  console.log(`   By platform:`, finalStats.by_platform);
  console.log(`   Total API cost: ${finalStats.total_cost} queries`);
  console.log('');
  console.log(`📈 This session:`);
  console.log(`   ✅ Successfully collected: ${totalSuccess}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('');
  console.log('🎉 You can now use the hybrid audience system!');
  console.log('   Real reports will be used when available, with synthetic fallback.');
}

// Execute the script
if (require.main === module) {
  collectAudienceReports()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { collectAudienceReports };
