# OpenAI Audience Inference - Documentation

This document describes the standalone OpenAI-based Instagram audience demographics inference system.

## Overview

The OpenAI Audience Inference system uses GPT-4o to analyze Instagram profiles and infer likely audience demographics (age, gender, geography). This is a **testing phase implementation** that runs independently of the main application.

### Key Features

- 🤖 **OpenAI GPT-4o** powered inference
- 🔍 **Puppeteer-based** Instagram scraping
- 💾 **Aggressive caching** (90-day TTL)
- 💰 **Cost tracking** and budget controls
- 🎯 **Structured JSON output** matching existing format
- 🛠️ **CLI interface** for easy usage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Interface                          │
│              (openai-audience-inference.ts)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 OpenAI Audience Service                     │
│          (openai-audience.service.ts)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Cache      │  │  Instagram   │  │   OpenAI API    │  │
│  │   Manager    │  │   Scraper    │  │   Integration   │  │
│  │  (JSON File) │  │ (Puppeteer)  │  │    (GPT-4o)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  Validation  │  │     Cost     │                       │
│  │   & Normali- │  │   Tracking   │                       │
│  │   zation     │  │              │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Environment Variables

Add the following variables to your `/back/.env` file:

```bash
# ============================================
# 🤖 OPENAI AUDIENCE INFERENCE (Required)
# ============================================

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-...your-api-key-here...

# Enable/Disable the inference system
OPENAI_AUDIENCE_INFERENCE_ENABLED=true

# OpenAI Model Configuration
OPENAI_AUDIENCE_MODEL=gpt-4o
OPENAI_AUDIENCE_TEMPERATURE=0.3
OPENAI_AUDIENCE_MAX_TOKENS=1000
OPENAI_AUDIENCE_TOP_P=0.9

# Instagram Scraping Configuration
IG_SCRAPING_TIMEOUT=30000
IG_SCRAPING_RETRIES=3
IG_SCRAPING_HEADLESS=true
IG_SCRAPING_DELAY=5000
IG_SCRAPING_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Cache Configuration
OPENAI_AUDIENCE_CACHE_ENABLED=true
OPENAI_AUDIENCE_CACHE_TTL_DAYS=90

# Cost Control
OPENAI_AUDIENCE_COST_CONTROL_ENABLED=true
OPENAI_AUDIENCE_MAX_COST_PER_DAY=10.00
OPENAI_AUDIENCE_MAX_COST_PER_INFERENCE=0.20
```

### 2. Install Dependencies

All required dependencies should already be installed. If not:

```bash
cd back
npm install
```

Required packages:
- `puppeteer` - Instagram scraping
- `openai` - OpenAI API client
- `commander` - CLI interface

### 3. Verify Setup

Check that the script is executable:

```bash
npm run infer-audience:stats
```

If successful, you should see cache statistics (even if empty).

## Usage

### Single Profile Inference

Infer audience demographics for a single Instagram profile:

```bash
npm run infer-audience -- infer --url "https://instagram.com/username"
```

#### Options

- `--url <url>` - **Required.** Instagram profile URL
- `--dry-run` - Test scraping without calling OpenAI API (no cost)
- `--force` - Bypass cache and force new inference
- `--mock` - Use mock responses instead of real API call (testing)
- `--no-cache` - Skip cache read and write
- `--timeout <ms>` - Override scraping timeout (default: 30000)
- `--max-retries <n>` - Override max retry attempts (default: 3)

#### Examples

```bash
# Basic inference
npm run infer-audience -- infer --url "https://instagram.com/gonchobanzas"

# Dry run (test scraping only, no API call)
npm run infer-audience -- infer --url "https://instagram.com/username" --dry-run

# Force refresh (bypass cache)
npm run infer-audience -- infer --url "https://instagram.com/username" --force

# Mock mode (no API call, uses fake data)
npm run infer-audience -- infer --url "https://instagram.com/username" --mock
```

### Batch Processing

Process multiple profiles from a CSV file:

```bash
npm run infer-audience -- batch --file data/influencers.csv
```

#### CSV Format

The CSV file must have a `url` column:

```csv
url
https://instagram.com/influencer1
https://instagram.com/influencer2
https://instagram.com/influencer3
```

#### Options

- `--file <path>` - **Required.** Path to CSV file
- `--delay <ms>` - Delay between requests (default: 5000)
- `--dry-run` - Test without calling OpenAI API
- `--force` - Bypass cache for all profiles
- `--max-retries <n>` - Max retry attempts per profile

#### Examples

```bash
# Process CSV file
npm run infer-audience -- batch --file data/influencers.csv

# With custom delay (10 seconds between requests)
npm run infer-audience -- batch --file data/influencers.csv --delay 10000

# Dry run (test scraping only)
npm run infer-audience -- batch --file data/influencers.csv --dry-run
```

Results are saved to `{filename}_results.json` in the same directory.

### Cache Management

#### View Statistics

Show cache and cost statistics:

```bash
npm run infer-audience:stats
```

Output includes:
- Total cached entries
- Valid vs expired entries
- Total cost
- Average cost per inference
- Date range of cached data

#### Clear Cache

Remove all cached inference data:

```bash
npm run infer-audience:clear -- --confirm
```

⚠️ **Warning:** This permanently deletes all cached inferences. You must use `--confirm` to proceed.

## Output Format

The inference returns audience demographics in the following format:

```json
{
  "age": {
    "13-17": 5.0,
    "18-24": 35.0,
    "25-34": 40.0,
    "35-44": 15.0,
    "45-54": 4.0,
    "55+": 1.0
  },
  "gender": {
    "male": 55.0,
    "female": 45.0
  },
  "geography": [
    {
      "country": "Argentina",
      "country_code": "AR",
      "percentage": 60.0
    },
    {
      "country": "United States",
      "country_code": "US",
      "percentage": 15.0
    },
    // ... up to 10 countries
  ],
  "is_synthetic": false,
  "inference_source": "openai",
  "model_used": "gpt-4o",
  "inferred_at": "2025-12-05T10:30:00.000Z"
}
```

### Validation Rules

- All age percentages sum to exactly **100.0**
- Male + Female percentages sum to exactly **100.0**
- Top 10 geography entries sum to exactly **100.0**
- All percentages have **1 decimal place**
- Country codes are valid **ISO 3166-1 alpha-2** (e.g., "US", "AR", "MX")

## Cost Management

### Estimated Costs

- **Per inference:** ~$0.05 USD
  - Input tokens (~2000): $0.02
  - Output tokens (~500): $0.03

### Budget Controls

The system implements several cost control mechanisms:

1. **Daily Budget Limit**
   - Default: $10.00/day (configurable via `OPENAI_AUDIENCE_MAX_COST_PER_DAY`)
   - Prevents accidental overspending
   - Blocks new inferences if limit exceeded

2. **Aggressive Caching**
   - 90-day TTL (configurable via `OPENAI_AUDIENCE_CACHE_TTL_DAYS`)
   - Typical cache hit rate: >80% after initial collection
   - Reduces costs dramatically for repeated queries

3. **Cost Tracking**
   - All API calls logged to `/back/logs/openai-costs.log`
   - Format: `timestamp,operation,cost,model,status,url`
   - Use for auditing and cost analysis

### Cost Log Example

```
2025-12-05T10:30:00.000Z,inference,0.05,gpt-4o,success,https://instagram.com/username
2025-12-05T10:35:00.000Z,inference,0.05,gpt-4o,success,https://instagram.com/username2
2025-12-05T10:40:00.000Z,inference,0.00,gpt-4o,failed,https://instagram.com/private
```

## Caching

### How It Works

1. **Cache Key Generation**
   - URL is normalized (lowercase, remove trailing slash, remove query params)
   - SHA-256 hash is computed from normalized URL
   - Example: `https://instagram.com/username` → `abc123...def`

2. **Cache Storage**
   - File-based: `/back/src/data/openai-audience-cache.json`
   - Structure:
     ```json
     {
       "version": "1.0.0",
       "entries": {
         "abc123hash": {
           "url": "https://instagram.com/username",
           "username": "username",
           "demographics": { ... },
           "model": "gpt-4o",
           "cached_at": "2025-12-05T10:30:00Z",
           "expires_at": "2026-03-05T10:30:00Z",
           "api_cost": 0.05
         }
       }
     }
     ```

3. **Cache Expiration**
   - TTL: 90 days (configurable)
   - Automatic cleanup on read
   - Manual cleanup via `clear-cache` command

### Cache Hit Rate

With aggressive caching, typical hit rates after initial collection:

- **1 week:** ~60%
- **1 month:** ~80%
- **3 months:** ~90%

This dramatically reduces costs for repeated queries.

## Error Handling

### Common Errors

#### 1. Instagram Scraping Failed

**Error:** `Failed to fetch Instagram profile after 3 attempts`

**Causes:**
- Private Instagram profile
- Invalid URL
- Rate limiting from Instagram
- Network issues

**Solutions:**
- Verify URL is correct and public
- Increase timeout: `--timeout 60000`
- Increase retries: `--max-retries 5`
- Add delays between requests in batch mode

#### 2. OpenAI API Failed

**Error:** `OpenAI API call failed: ...`

**Causes:**
- Invalid API key
- Rate limiting from OpenAI
- Network issues
- Model not available

**Solutions:**
- Verify `OPENAI_API_KEY` in `.env`
- Check OpenAI account status
- Wait and retry

#### 3. Daily Budget Exceeded

**Error:** `Daily budget exceeded: $10.05/$10.00`

**Causes:**
- Too many inferences in one day
- Budget set too low

**Solutions:**
- Increase budget: `OPENAI_AUDIENCE_MAX_COST_PER_DAY=20.00`
- Wait until tomorrow
- Use cache hits (no cost)

#### 4. Validation Failed

**Error:** `Validation failed: Age sum is 95.0, expected 100.0`

**Causes:**
- OpenAI returned invalid JSON
- Response didn't match expected format

**Solutions:**
- This is rare, retry usually works
- Check OpenAI API status
- Report issue if persistent

## Testing

### Test Modes

#### 1. Dry Run Mode

Test Instagram scraping without calling OpenAI API (zero cost):

```bash
npm run infer-audience -- infer --url "https://instagram.com/username" --dry-run
```

This validates:
- URL accessibility
- Profile extraction
- Data parsing

#### 2. Mock Mode

Test full flow with fake data (zero cost):

```bash
npm run infer-audience -- infer --url "https://instagram.com/username" --mock
```

This validates:
- Output format
- Caching logic
- Cost tracking

#### 3. Single Test

Run one real inference to validate everything works:

```bash
npm run infer-audience -- infer --url "https://instagram.com/username"
```

**Cost:** ~$0.05

### Recommended Testing Workflow

1. **Dry run** 5-10 profiles to test scraping
2. **Single test** with 1 real profile to verify API
3. **Batch test** with 10 profiles to test caching
4. Monitor costs via `infer-audience:stats`

## Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:

```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Rate Limiting

If you hit Instagram rate limits:

- Increase delay between requests: `--delay 10000`
- Use `--headless false` to see browser (debugging)
- Rotate user agents (advanced)

### Cache Issues

If cache seems corrupted:

```bash
npm run infer-audience:clear -- --confirm
```

Then rebuild cache fresh.

## File Structure

```
back/
├── src/
│   ├── config/
│   │   └── openai-audience.config.ts         # Configuration
│   ├── models/
│   │   └── audience/
│   │       └── openai-audience-inference.model.ts  # Type definitions
│   ├── services/
│   │   └── audience/
│   │       └── openai-audience.service.ts    # Core service
│   ├── scripts/
│   │   └── openai-audience-inference.ts      # CLI interface
│   └── data/
│       └── openai-audience-cache.json        # Cache file (gitignored)
├── logs/
│   └── openai-costs.log                      # Cost tracking log
└── docs/
    └── OPENAI_AUDIENCE_INFERENCE.md          # This document
```

## Future Integration

When ready to integrate into the main application:

### 1. Database Migration

Create table for persistent storage:

```sql
CREATE TABLE openai_audience_inferences (
  id UUID PRIMARY KEY,
  instagram_url VARCHAR(500) UNIQUE,
  instagram_username VARCHAR(255),
  audience_demographics JSONB,
  audience_geography JSONB,
  model_used VARCHAR(50),
  inferred_at TIMESTAMP,
  expires_at TIMESTAMP,
  api_cost NUMERIC(10, 4)
);
```

### 2. API Endpoint

Add endpoint to main application:

```typescript
// GET /api/influencers/:id/audience/openai
router.get('/:id/audience/openai', async (req, res) => {
  const service = new OpenAIAudienceService();
  const result = await service.inferAudience(req.params.id);
  res.json(result);
});
```

### 3. UI Toggle

Add option in explorer/suggester:

```tsx
<Toggle>
  <Option value="synthetic">Synthetic (Fast)</Option>
  <Option value="openai">OpenAI (Accurate)</Option>
</Toggle>
```

## FAQ

### Q: How accurate is the inference?

A: OpenAI makes educated guesses based on profile content, language, hashtags, and engagement patterns. It's not 100% accurate but provides reasonable estimates. For ground truth, use HypeAuditor reports.

### Q: Can I use this in production?

A: This is currently a **testing phase** implementation. For production use, integrate into the database and add proper error handling, monitoring, and user permissions.

### Q: What if the Instagram profile is private?

A: Puppeteer cannot access private profiles. The inference will fail with an error. Only public profiles are supported.

### Q: How long does one inference take?

A: Typical time: 15-30 seconds
- Scraping: 10-15 seconds
- OpenAI API: 5-10 seconds
- Validation: <1 second

### Q: Can I process thousands of profiles?

A: Yes, but consider:
- Cost: $50 per 1000 profiles (without caching)
- Time: ~6-8 hours for 1000 profiles (with 5s delay)
- Rate limits: Instagram may block after ~100 requests/hour

Use batch mode with appropriate delays and monitor costs closely.

### Q: What OpenAI models are supported?

A: Currently supports `gpt-4o` (default). Other models like `gpt-4-turbo` should work but are untested. Change via `OPENAI_AUDIENCE_MODEL` environment variable.

## Support

For issues or questions:

1. Check this documentation
2. Review error messages and logs
3. Test with dry-run mode first
4. Check OpenAI API status
5. Verify environment variables are set correctly

## License

This is part of the Catch Influencer platform. Internal use only.
