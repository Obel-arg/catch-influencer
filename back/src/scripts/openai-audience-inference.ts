#!/usr/bin/env ts-node

/**
 * OpenAI Audience Inference CLI
 *
 * Command-line interface for inferring Instagram audience demographics using OpenAI API.
 *
 * Usage:
 *   npm run infer-audience -- infer --url "https://instagram.com/username"
 *   npm run infer-audience -- batch --file data/influencers.csv
 *   npm run infer-audience -- stats
 *   npm run infer-audience -- clear-cache
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenAIAudienceService } from '../services/audience/openai-audience.service';
import { InferenceOptions, BatchInferenceRequest, BatchInferenceResult } from '../models/audience/openai-audience-inference.model';

const program = new Command();

/**
 * Main program
 */
program
  .name('openai-audience-inference')
  .description('Infer Instagram audience demographics using OpenAI API')
  .version('1.0.0');

/**
 * Infer command - single profile inference
 */
program
  .command('infer')
  .description('Infer audience for a single Instagram profile')
  .requiredOption('-u, --url <url>', 'Instagram profile URL')
  .option('--dry-run', 'Test scraping without calling OpenAI API', false)
  .option('--force', 'Bypass cache and force new inference', false)
  .option('--mock', 'Use mock OpenAI responses (no API call)', false)
  .option('--no-cache', 'Skip cache read and write', false)
  .option('--timeout <ms>', 'Scraping timeout in milliseconds', '30000')
  .option('--max-retries <n>', 'Maximum retry attempts', '3')
  .action(async (options) => {
    const service = new OpenAIAudienceService();

    try {
      console.log('🚀 Starting inference...\n');
      console.log(`URL: ${options.url}`);
      console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.mock ? 'MOCK' : 'LIVE'}`);
      console.log(`Cache: ${options.cache ? 'Enabled' : 'Disabled'}`);
      console.log(`Force Refresh: ${options.force ? 'Yes' : 'No'}\n`);

      const inferenceOptions: InferenceOptions = {
        dryRun: options.dryRun,
        forceRefresh: options.force,
        mockMode: options.mock,
        skipCache: !options.cache,
        timeout: parseInt(options.timeout, 10),
        maxRetries: parseInt(options.maxRetries, 10),
      };

      const result = await service.inferAudience(options.url, inferenceOptions);

      if (result.success) {
        console.log('\n✅ Inference successful!\n');
        console.log('='.repeat(60));
        console.log('AUDIENCE DEMOGRAPHICS');
        console.log('='.repeat(60));

        console.log('\n📊 Age Distribution:');
        if (result.demographics?.age) {
          Object.entries(result.demographics.age).forEach(([range, pct]) => {
            const bar = '█'.repeat(Math.round(pct / 2));
            console.log(`  ${range.padEnd(8)} ${pct.toFixed(1).padStart(5)}% ${bar}`);
          });
        }

        console.log('\n👥 Gender Distribution:');
        if (result.demographics?.gender) {
          Object.entries(result.demographics.gender).forEach(([gender, pct]) => {
            const bar = '█'.repeat(Math.round(pct / 2));
            console.log(`  ${gender.padEnd(8)} ${pct.toFixed(1).padStart(5)}% ${bar}`);
          });
        }

        console.log('\n🌍 Geographic Distribution (Top 10):');
        if (result.demographics?.geography) {
          result.demographics.geography.forEach((geo, i) => {
            const bar = '█'.repeat(Math.round(geo.percentage / 2));
            console.log(`  ${(i + 1).toString().padStart(2)}. ${geo.country.padEnd(20)} (${geo.country_code}) ${geo.percentage.toFixed(1).padStart(5)}% ${bar}`);
          });
        }

        console.log('\n' + '='.repeat(60));
        console.log(`Cached: ${result.cached ? 'Yes' : 'No'}`);
        console.log(`Cost: $${result.cost?.toFixed(4) || '0.0000'}`);
        if (result.demographics?.inferred_at) {
          console.log(`Inferred At: ${result.demographics.inferred_at.toISOString()}`);
        }
        console.log('='.repeat(60) + '\n');

        // Output JSON for piping
        if (process.env.JSON_OUTPUT === 'true') {
          console.log('\nJSON Output:');
          console.log(JSON.stringify(result.demographics, null, 2));
        }

        process.exit(0);
      } else {
        console.error('\n❌ Inference failed!\n');
        console.error(`Error: ${result.error}`);
        if (result.details) {
          console.error('\nDetails:', JSON.stringify(result.details, null, 2));
        }
        process.exit(1);
      }
    } catch (error: any) {
      console.error('\n❌ Unexpected error:', error.message);
      console.error(error.stack);
      process.exit(1);
    } finally {
      await service.close();
    }
  });

/**
 * Batch command - process multiple profiles from CSV
 */
program
  .command('batch')
  .description('Batch inference from CSV file')
  .requiredOption('-f, --file <path>', 'Path to CSV file with Instagram URLs (must have "url" column)')
  .option('--delay <ms>', 'Delay between requests in milliseconds', '5000')
  .option('--dry-run', 'Test without calling OpenAI API', false)
  .option('--force', 'Bypass cache for all profiles', false)
  .option('--max-retries <n>', 'Maximum retry attempts per profile', '3')
  .action(async (options) => {
    const service = new OpenAIAudienceService();

    try {
      console.log('🚀 Starting batch inference...\n');

      // Read CSV file
      const csvPath = path.resolve(options.file);
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(Boolean);

      if (lines.length === 0) {
        console.error('❌ CSV file is empty');
        process.exit(1);
      }

      // Parse header
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const urlIndex = header.indexOf('url');

      if (urlIndex === -1) {
        console.error('❌ CSV file must have a "url" column');
        process.exit(1);
      }

      // Parse URLs
      const urls = lines
        .slice(1)
        .map((line) => line.split(',')[urlIndex]?.trim())
        .filter(Boolean);

      console.log(`Found ${urls.length} URLs in CSV file\n`);

      const delay = parseInt(options.delay, 10);
      const inferenceOptions: InferenceOptions = {
        dryRun: options.dryRun,
        forceRefresh: options.force,
        maxRetries: parseInt(options.maxRetries, 10),
      };

      const results: BatchInferenceResult = {
        total: urls.length,
        successful: 0,
        failed: 0,
        cached: 0,
        totalCost: 0,
        results: [],
      };

      // Process each URL
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`\n[${ i + 1}/${urls.length}] Processing: ${url}`);
        console.log('-'.repeat(60));

        try {
          const result = await service.inferAudience(url, inferenceOptions);
          results.results.push({ url, result });

          if (result.success) {
            results.successful++;
            if (result.cached) results.cached++;
            results.totalCost += result.cost || 0;

            console.log(`  ✅ Success (cost: $${result.cost?.toFixed(4)})`);
          } else {
            results.failed++;
            console.log(`  ❌ Failed: ${result.error}`);
          }
        } catch (error: any) {
          results.failed++;
          results.results.push({
            url,
            result: { success: false, error: error.message },
          });
          console.log(`  ❌ Error: ${error.message}`);
        }

        // Delay between requests (except for last one)
        if (i < urls.length - 1 && !options.dryRun) {
          console.log(`  ⏳ Waiting ${delay / 1000}s before next request...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('BATCH PROCESSING SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total Processed: ${results.total}`);
      console.log(`Successful: ${results.successful} (${((results.successful / results.total) * 100).toFixed(1)}%)`);
      console.log(`Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
      console.log(`Cached: ${results.cached} (${((results.cached / results.total) * 100).toFixed(1)}%)`);
      console.log(`Total Cost: $${results.totalCost.toFixed(4)}`);
      console.log(`Average Cost: $${(results.totalCost / results.successful || 0).toFixed(4)}`);
      console.log('='.repeat(60) + '\n');

      // Save results to JSON
      const outputPath = csvPath.replace(/\.csv$/, '_results.json');
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
      console.log(`✅ Results saved to: ${outputPath}\n`);

      process.exit(results.failed === 0 ? 0 : 1);
    } catch (error: any) {
      console.error('\n❌ Batch processing error:', error.message);
      console.error(error.stack);
      process.exit(1);
    } finally {
      await service.close();
    }
  });

/**
 * Stats command - show cache statistics
 */
program
  .command('stats')
  .description('Show cache and cost statistics')
  .action(async () => {
    const service = new OpenAIAudienceService();

    try {
      console.log('📊 Cache Statistics\n');
      console.log('='.repeat(60));

      const stats = await service.getCacheStats();

      console.log(`Total Entries: ${stats.totalEntries}`);
      console.log(`Valid Entries: ${stats.expirationBreakdown.valid}`);
      console.log(`Expired Entries: ${stats.expirationBreakdown.expired}`);

      if (stats.totalEntries > 0) {
        console.log(`\nTotal Cost: $${stats.totalCost.toFixed(4)}`);
        console.log(`Average Cost: $${stats.averageCost.toFixed(4)}`);

        if (stats.oldestEntry) {
          console.log(`\nOldest Entry: ${stats.oldestEntry.toISOString().split('T')[0]}`);
        }
        if (stats.newestEntry) {
          console.log(`Newest Entry: ${stats.newestEntry.toISOString().split('T')[0]}`);
        }
      }

      console.log('='.repeat(60) + '\n');

      process.exit(0);
    } catch (error: any) {
      console.error('❌ Error getting stats:', error.message);
      process.exit(1);
    } finally {
      await service.close();
    }
  });

/**
 * Clear cache command
 */
program
  .command('clear-cache')
  .description('Clear all cached inferences')
  .option('--confirm', 'Skip confirmation prompt', false)
  .action(async (options) => {
    const service = new OpenAIAudienceService();

    try {
      if (!options.confirm) {
        console.log('⚠️  WARNING: This will delete all cached inference data.\n');
        console.log('Run with --confirm to proceed.\n');
        console.log('Example: npm run infer-audience -- clear-cache --confirm\n');
        process.exit(0);
      }

      console.log('🗑️  Clearing cache...\n');
      await service.clearCache();
      console.log('✅ Cache cleared successfully\n');

      process.exit(0);
    } catch (error: any) {
      console.error('❌ Error clearing cache:', error.message);
      process.exit(1);
    } finally {
      await service.close();
    }
  });

/**
 * Parse CLI arguments
 */
program.parse();
