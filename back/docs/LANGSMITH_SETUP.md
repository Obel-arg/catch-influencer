# LangSmith Integration Setup

LangSmith provides observability for all LangGraph executions, allowing you to see traces, metrics, and debug issues in real-time.

## Quick Setup

### 1. Get Your LangSmith API Key

1. Go to https://smith.langchain.com/
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key (starts with `lsv2_pt_`)

### 2. Add Environment Variables

Add these variables to your `.env` file in the `back/` directory:

```env
# LangSmith Observability Configuration
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_xxxxx  # Replace with your LangSmith API key
LANGCHAIN_PROJECT=catch-influencer-audience  # Project name in LangSmith dashboard
```

### 3. Optional Configuration

```env
# Enable verbose logging (default: false)
LANGCHAIN_VERBOSE=false

# Set environment (dev, staging, prod)
LANGCHAIN_ENVIRONMENT=development
```

## What You'll See in LangSmith

Once configured, every graph execution will automatically appear in LangSmith with:

- **Run Name**: `audience-analysis-{username}` - Easy to identify which influencer was analyzed
- **Tags**: Filter by `agent-audience`, `langgraph`, `with-influencer-id`, etc.
- **Metadata**: Instagram URL, username, influencer ID, search context
- **Trace Tree**: Complete execution flow showing:
  - `scrape` node (Tavily scraping)
  - `bioGenerator` node (parallel bio generation)
  - `llamaAnalyst` node (Llama analysis)
  - `geminiAnalyst` node (Gemini analysis)
  - `debate` node (multi-round debate)
  - `judge` node (final aggregation)
- **Timings**: Execution time for each node
- **Tokens**: Token usage per model
- **Errors**: Stack traces and error details

## Viewing Traces

1. Go to https://smith.langchain.com/
2. Select the `catch-influencer-audience` project
3. Click on any run to see the full trace
4. Expand nodes to see inputs/outputs
5. Use filters to find specific runs (by username, influencer ID, etc.)

## Troubleshooting

**No traces appearing?**
- Verify `LANGCHAIN_TRACING_V2=true` is set
- Check that `LANGCHAIN_API_KEY` is correct
- Ensure the API key has proper permissions

**Want to disable tracing temporarily?**
- Set `LANGCHAIN_TRACING_V2=false` or remove the variable
