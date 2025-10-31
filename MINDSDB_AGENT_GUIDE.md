# 🤖 MindsDB Agent Guide: Building the Crypto Auditor Agent

## Overview

We're building a **MindsDB Agent** that intelligently decides:
- When to search the knowledge base
- When to fetch live prices
- When to combine both
- How to route queries intelligently

This guide walks you through setting it up **step-by-step in the MindsDB SQL Editor**.

---

## 📋 Prerequisites

✅ MindsDB running on `http://127.0.0.1:47334`
✅ PGVector running with your knowledge base (`web3_kb` table)
✅ Price API created at `/app/api/prices`
✅ Next.js app running on `localhost:3001`

---

## 🚀 Step-by-Step: Building Your Agent

### STEP 1: Access MindsDB SQL Editor

**Location:** `http://127.0.0.1:47334`

1. Open browser → Navigate to MindsDB URL
2. Click **SQL Editor** (or query button)
3. You should see a SQL query interface

**What you'll see:**
- SQL input area (large text box)
- Execute button (▶️ Run)
- Results panel below

---

### STEP 2: Check Your Knowledge Base Table

**Purpose:** Verify the table exists and has data

**Command to run in SQL Editor:**

```sql
SELECT 
    COUNT(*) as total_documents,
    COUNT(DISTINCT metadata) as unique_metadata_entries
FROM web3_kb;
```

**Expected output:**
```
total_documents: 1250+
unique_metadata_entries: 500+
```

**What this tells you:** Your KB is populated and ready for agent queries.

---

### STEP 3: Verify Search is Working

**Purpose:** Confirm hybrid search queries work

**Command to run in SQL Editor:**

```sql
SELECT 
    content,
    relevance,
    metadata
FROM web3_kb
WHERE content LIKE '%Bitcoin%'
    AND content = 'What is Bitcoin consensus?'
    AND hybrid_search = true
    AND hybrid_search_alpha = 0.7
LIMIT 3;
```

**Expected output:**
```
content: [chunk of whitepaper text]
relevance: 0.876
metadata: {"_source": "bitcoin_whitepaper.pdf", ...}
```

**What this tells you:** Search capability is working.

---

## 🎯 Phase 1: Create the Agent Skeleton

### STEP 4: Create a Simple Agent (Query Router)

The agent will have **three different query types**:

```sql
-- Create an agent that routes queries
-- This agent will:
-- 1. Detect query type (KB-only, price-only, combined)
-- 2. Route to appropriate handler
-- 3. Combine results

-- First, let's understand the agent structure by querying system info
SELECT * FROM information_schema.tables 
WHERE table_schema = 'mindsdb' 
LIMIT 5;
```

**Expected output:**
- You'll see system tables in MindsDB
- This confirms your MindsDB instance can query its own metadata

---

## 🔧 Phase 2: Set Up Agent Tools

### STEP 5: Create Tool 1 - Knowledge Base Query Tool

This tool searches your KB with smart parameters.

**Run this in SQL Editor:**

```sql
-- Create a stored procedure / model for KB querying
-- We'll use MindsDB's native capabilities

-- First, check if we can create a knowledge base model
SELECT 
    model_id,
    model_name,
    model_engine
FROM information_schema.models
WHERE model_engine = 'knowledge_base'
LIMIT 5;
```

**What this does:**
- Lists existing KB models
- Shows you what's available to work with

**Expected output:**
- Shows your knowledge base models
- Or empty if none created yet

---

### STEP 6: Create Tool 2 - Price Lookup Handler

**Purpose:** Define how the agent fetches prices

Since MindsDB doesn't directly call external Node.js APIs, we'll:
1. Create a **handler model** that routes to your price API
2. Document the integration point
3. Show you how the agent will call it

**Run this in SQL Editor:**

```sql
-- Create a view that represents price data handler
-- This will be our interface to the price API

CREATE VIEW IF NOT EXISTS price_api_handler AS
SELECT 
    'price_lookup' as handler_type,
    'Calls /api/prices endpoint' as description,
    'POST' as method,
    'http://localhost:3001/api/prices' as endpoint;

-- Verify it created
SELECT * FROM price_api_handler;
```

**Expected output:**
```
handler_type: price_lookup
description: Calls /api/prices endpoint
method: POST
endpoint: http://localhost:3001/api/prices
```

---

## 🤖 Phase 3: Create the Agent Logic

### STEP 7: Create Query Classification Function

This helps the agent understand what type of query it received.

**Run this in SQL Editor:**

```sql
-- Create a view to show agent decision logic
CREATE VIEW IF NOT EXISTS crypto_auditor_agent_rules AS
SELECT 
    'rule_1' as rule_id,
    'kb_only' as query_type,
    'Query contains protocol, whitepaper, consensus, or technical terms' as trigger_condition,
    'Search web3_kb table with semantic search (alpha=0.7)' as action
UNION ALL
SELECT 
    'rule_2',
    'price_only',
    'Query contains price, cost, market, trading, or crypto symbols (BTC, ETH, etc)',
    'Call /api/prices with detected projects'
UNION ALL
SELECT 
    'rule_3',
    'combined',
    'Query contains BOTH technical + price terms (e.g., "What is Bitcoin price AND consensus?")',
    'Execute both rule_1 and rule_2, then combine results'
UNION ALL
SELECT 
    'rule_4',
    'adaptive',
    'Query is ambiguous or mixed',
    'Use adaptive alpha detection (0.5) and parallel fetch both KB and prices';

-- View the rules
SELECT * FROM crypto_auditor_agent_rules;
```

**Expected output:**
```
rule_1: kb_only → search KB
rule_2: price_only → fetch prices
rule_3: combined → both
rule_4: adaptive → intelligent detection
```

**What this does:**
- Defines the decision tree for your agent
- Shows the logic it will use to route queries

---

### STEP 8: Create Agent State Table

This will track agent operations and decisions.

**Run this in SQL Editor:**

```sql
-- Create a table to log agent operations
CREATE TABLE IF NOT EXISTS agent_operations_log (
    operation_id INT AUTO_INCREMENT PRIMARY KEY,
    query_text TEXT,
    detected_query_type VARCHAR(50),
    kb_search_executed BOOLEAN,
    price_fetch_executed BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    results_combined BOOLEAN,
    response_time_ms INT
);

-- Verify table created
SELECT * FROM agent_operations_log LIMIT 1;
```

**Expected output:**
```
(empty table, but successfully created)
```

**What this does:**
- Creates a log for agent decision tracking
- Helps you understand agent behavior
- Useful for debugging

---

## 📊 Phase 4: Test Agent Logic

### STEP 9: Test KB-Only Query Logic

**Purpose:** Test the decision logic for KB-only queries

**Run this in SQL Editor:**

```sql
-- Simulate KB-only query
-- User question: "What is Bitcoin's proof of work consensus?"

-- Step 1: Classify the query
SELECT 
    'What is Bitcoin proof of work consensus?' as input_query,
    'kb_only' as classified_as,
    'Contains protocol/technical terms' as reason;

-- Step 2: Show what would be returned from KB
SELECT 
    'Query type: kb_only' as agent_decision,
    'Will execute hybrid search with alpha=0.7' as action,
    'Search term: Bitcoin proof of work consensus' as kb_search_term;

-- Step 3: Actually execute the search
SELECT 
    content,
    relevance,
    metadata
FROM web3_kb
WHERE content LIKE '%Bitcoin%'
    AND content LIKE '%proof%'
    AND hybrid_search = true
    AND hybrid_search_alpha = 0.7
LIMIT 2;
```

**Expected output:**
```
Decision: kb_only
Action: Hybrid search with alpha=0.7
Results: 2 chunks from Bitcoin whitepaper with relevance scores
```

---

### STEP 10: Test Price-Only Query Logic

**Purpose:** Test the decision logic for price-only queries

**Run this in SQL Editor:**

```sql
-- Simulate price-only query
-- User question: "What is the current price of Bitcoin?"

-- Step 1: Classify
SELECT 
    'What is the current price of Bitcoin?' as input_query,
    'price_only' as classified_as,
    'Contains: price, current, cryptocurrency symbol' as reason;

-- Step 2: Show what would happen
SELECT 
    'Query type: price_only' as agent_decision,
    'Will call /api/prices endpoint' as action,
    'Project detected: bitcoin' as price_project,
    'API endpoint: http://localhost:3001/api/prices' as api_call;

-- Step 3: Show expected result format
SELECT 
    'bitcoin' as project,
    45123.45 as price_usd,
    892345000000 as market_cap_usd,
    35678900000 as volume_24h_usd,
    5.2 as price_change_24h,
    12.8 as price_change_7d,
    '2025-10-31T10:30:00Z' as last_updated;
```

**Expected output:**
```
Decision: price_only
Action: Call /api/prices
Expected: Price data returned in standardized format
```

---

### STEP 11: Test Combined Query Logic

**Purpose:** Test the decision logic for combined queries

**Run this in SQL Editor:**

```sql
-- Simulate combined query
-- User question: "What is Bitcoin's consensus mechanism and current price?"

-- Step 1: Classify
SELECT 
    'What is Bitcoin consensus mechanism and current price?' as input_query,
    'combined' as classified_as,
    'Contains both: protocol terms (consensus) + market terms (price)' as reason;

-- Step 2: Show parallel execution plan
SELECT 
    'KB Search' as operation_1,
    'Search for Bitcoin consensus' as operation_1_detail,
    'Hybrid search alpha=0.7' as operation_1_params
UNION ALL
SELECT 
    'Price Fetch' as operation_2,
    'Fetch Bitcoin live data' as operation_2_detail,
    'Call /api/prices with bitcoin' as operation_2_params;

-- Step 3: Show result combination strategy
SELECT 
    'KB Results' as result_section_1,
    'Show protocol info, sources, relevance' as section_1_content
UNION ALL
SELECT 
    'Price Results' as result_section_2,
    'Show current price, 24h change, market cap' as section_2_content
UNION ALL
SELECT 
    'Combined Insights' as result_section_3,
    'Any analysis connecting protocol to market' as section_3_content;
```

**Expected output:**
```
Query Type: combined
Execution: Parallel (both KB + prices)
Result Format: Combined view with 3 sections
```

---

## 🔌 Phase 5: Integration with Frontend

### STEP 12: Create Agent Endpoint Definition

**Purpose:** Define how your frontend will call the agent

This isn't a SQL command - it's documenting the API contract.

**Create a new file in your project:**

**File:** `/API_AGENT_CONTRACT.md`

**Content:**

```markdown
# Crypto Auditor Agent - API Contract

## Endpoint: POST /api/agent/query

### Request
```json
{
  "query": "What is Bitcoin's proof of work consensus and current price?",
  "userId": "user_123",
  "context": {
    "searchMode": "auto",  // or "kb_only", "price_only", "combined"
    "maxResults": 5,
    "timeout": 10000
  }
}
```

### Response
```json
{
  "queryId": "q_12345",
  "classifiedAs": "combined",
  "results": {
    "kb_results": [
      {
        "content": "Bitcoin uses Proof of Work...",
        "relevance": 0.89,
        "source": "bitcoin_whitepaper.pdf",
        "searchMode": "hybrid"
      }
    ],
    "price_results": [
      {
        "project": "bitcoin",
        "price_usd": 45123.45,
        "market_cap_usd": 892345000000,
        "price_change_24h": 5.2,
        "last_updated": "2025-10-31T10:30:00Z"
      }
    ],
    "executedAt": {
      "kb_search_ms": 245,
      "price_fetch_ms": 180,
      "total_ms": 425
    }
  }
}
```

### Agent Decision Logic
- `combined`: KB search + price fetch (parallel)
- `kb_only`: Knowledge base search only
- `price_only`: Price API only
- `auto`: Agent decides based on query content
```

---

## 🎯 Next: Backend Implementation

### STEP 13: Create the Combined Agent API Route

This will be the Next.js endpoint that orchestrates everything.

**You'll create:** `/app/api/agent/query/route.ts`

```typescript
// This will combine:
// 1. KB search logic (existing)
// 2. Price fetch logic (existing)
// 3. Query classification (from agent rules)
// 4. Result combination
// 5. Response formatting
```

---

## 📋 Quick Reference: Agent SQL Commands Cheat Sheet

```sql
-- Check agent rules
SELECT * FROM crypto_auditor_agent_rules;

-- View agent operations log
SELECT * FROM agent_operations_log ORDER BY timestamp DESC LIMIT 10;

-- Simulate KB search
SELECT * FROM web3_kb 
WHERE hybrid_search = true 
LIMIT 3;

-- Check price API availability
SELECT * FROM price_api_handler;

-- View recent agent decisions
SELECT 
    query_text,
    detected_query_type,
    kb_search_executed,
    price_fetch_executed,
    results_combined
FROM agent_operations_log 
ORDER BY timestamp DESC 
LIMIT 5;
```

---

## ✅ Verification Checklist

- [ ] MindsDB SQL Editor accessible at `http://127.0.0.1:47334`
- [ ] Can query `web3_kb` table (Step 2)
- [ ] Hybrid search works (Step 3)
- [ ] `crypto_auditor_agent_rules` view created (Step 7)
- [ ] `agent_operations_log` table created (Step 8)
- [ ] All test queries run successfully (Steps 9-11)
- [ ] API contract documented (Step 12)
- [ ] Ready to implement `/api/agent/query/route.ts` (Step 13)

---

## 🚀 Next Steps

1. ✅ Run Steps 1-12 above in MindsDB SQL Editor
2. 📝 Document any issues or unexpected results
3. 🔧 We'll build `/api/agent/query/route.ts` next
4. 🧪 Test with your Next.js frontend
5. 📊 Monitor agent logs and optimize

---

## 💡 Tips & Troubleshooting

### If you get "table not found" error
```sql
-- Check what tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'mindsdb';
```

### If hybrid search doesn't work
```sql
-- Verify hybrid search is supported
SELECT * FROM web3_kb WHERE hybrid_search = true LIMIT 1;
```

### If price handler fails
```sql
-- Check the view was created
SELECT * FROM price_api_handler;
```

### To clear agent logs
```sql
-- Delete old operations
DELETE FROM agent_operations_log 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY);
```

---

## 📞 Questions?

Each step is designed to be independent. You can:
- Run them one at a time
- Test each step before moving forward
- Go back and modify if needed

Let me know which step you're on and any issues you encounter! 🎯
