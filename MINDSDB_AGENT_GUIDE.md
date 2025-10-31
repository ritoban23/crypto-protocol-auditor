# 🤖 MindsDB Agent: Complete Implementation Guide

## Overview

Building a **MindsDB Agent** that intelligently combines:
- 📚 Knowledge Base searches (web3_kb - whitepapers)
- 💰 Live crypto prices (CoinGecko API via Next.js)
- 🎯 Smart query classification and routing

**Architecture:**
```
User Query → MindsDB Agent → Decides: KB / Prices / Both → Returns Combined Results
```

This guide provides **SQL-based agent creation** using MindsDB's native agent syntax.

---

## 📋 Prerequisites

✅ MindsDB running: `http://127.0.0.1:47334`
✅ PGVector with knowledge base: `web3_kb` table populated
✅ Next.js backend: Price API at `/app/api/prices` (port TBD - check with `npm run dev` output)
✅ OpenAI/Google API key for the agent's LLM (Gemini recommended)

---

## 🚀 Step-by-Step: Create Your MindsDB Agent

### STEP 1: Verify Knowledge Base Exists (2 min)

**Open MindsDB SQL Editor:** `http://127.0.0.1:47334`

Run this query to verify your KB:

```sql
-- Check KB table exists and has data
SELECT COUNT(*) as total_documents FROM web3_kb;
```

**Expected output:** `total_documents: 1000+`

If you get results → ✅ Your KB is ready!

---

### STEP 2: Test KB Query (3 min)

**IMPORTANT:** Don't select `content` column due to DuckDB limitations. Query metadata and relevance only:

```sql
-- Query KB for Bitcoin (without content column)
SELECT 
    relevance,
    metadata
FROM web3_kb
WHERE metadata LIKE '%Bitcoin%'
LIMIT 5;
```

**Expected output:** 5 rows with relevance scores and metadata JSON

If you get results → ✅ KB search works!

**Alternative** (if metadata search doesn't work, search on embeddings directly):

```sql
-- Use semantic search instead
SELECT 
    relevance,
    metadata
FROM web3_kb
WHERE content = 'Bitcoin proof of work'
LIMIT 3;
```

---

### STEP 3: Create the MindsDB Agent (10 min)

**Purpose:** Create an agent that can query your knowledge base intelligently

**SQL Command to run in MindsDB:**

```sql
CREATE AGENT crypto_auditor_agent
USING
    model = {
        "provider": "google",
        "model_name": "gemini-2.0-flash",
        "api_key": "YOUR_GOOGLE_API_KEY_HERE"
    },
    data = {
        "knowledge_bases": ["mindsdb.web3_kb"]
    },
    prompt_template='
        You are a crypto protocol auditor assistant.
        
        The knowledge base "mindsdb.web3_kb" contains:
        - Cryptocurrency whitepapers
        - Technical protocol documentation
        - Consensus mechanisms
        - Smart contract details
        
        When answering questions:
        1. Search the knowledge base for technical/protocol information
        2. Cite sources from metadata when available
        3. Be precise and technical
        4. If asked about prices or market data, say "I only have technical protocol data, not live prices"
    ',
    timeout=30;
```

**What this does:**
- Creates an agent named `crypto_auditor_agent`
- Uses Google Gemini 2.0 Flash as the LLM
- Connects to your `web3_kb` knowledge base
- Sets instructions for how to answer questions
- 30-second timeout for responses

**Replace `YOUR_GOOGLE_API_KEY_HERE`** with your actual Google API key.

**Expected output:** `Agent crypto_auditor_agent created successfully`

If you get this → ✅ Agent is created!

---

### STEP 4: Verify Agent Was Created (1 min)

```sql
SHOW AGENTS WHERE name = 'crypto_auditor_agent';
```

**Expected output:** Shows your agent with model details

---

### STEP 5: Query the Agent (5 min)

**Test 1: KB-Only Question**

```sql
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'What is Bitcoin proof of work consensus mechanism?';
```

**Expected output:** Detailed answer about PoW from the knowledge base

**Test 2: Another Technical Question**

```sql
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'Explain Ethereum smart contracts';
```

**Expected output:** Technical explanation from whitepapers

**Test 3: Price Question (should indicate no price data)**

```sql
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'What is the current price of Bitcoin?';
```

**Expected output:** Agent says it doesn't have live price data

If all 3 tests work → ✅ **Agent is fully functional!**

---

## 🔧 Phase 2: Connect Price API (Advanced)

**Option 1: MindsDB Skills (SQL-based - Recommended if you have HTTP skill support)**

MindsDB doesn't natively call external HTTP endpoints in agent queries. To call your `/api/prices` endpoint, you need to:

1. Create a custom ML handler/skill that calls HTTP endpoints, OR
2. Use the Next.js backend to orchestrate (call MindsDB agent for KB, call price API directly)

**We recommend Option 2** (Next.js orchestration) because:
- Your `/app/api/agent/query/route.ts` already exists
- It gives you full control over classification and combination
- MindsDB agent handles KB queries (what it's best at)
- Next.js handles price API and result merging

**Workflow:**
```
User → Next.js /api/agent/query → {
  1. Classify query (kb/price/both)
  2. If KB needed: Query MindsDB agent via SQL
  3. If price needed: Call /api/prices
  4. Combine results
  5. Return to user
}
```

---

## 🎯 Final Integration Steps

### Update Next.js Backend to Use MindsDB Agent

Modify `/app/api/agent/query/route.ts` to call the MindsDB agent instead of directly querying KB:

**Change this function:**

```typescript
// OLD: Direct KB query
async function executeKBSearch(query: string) {
  const response = await fetch('http://127.0.0.1:47335/api/sql', {
    method: 'POST',
    body: JSON.stringify({
      query: `SELECT content, relevance, metadata FROM web3_kb WHERE...`
    })
  });
  // ...
}
```

**To this:**

```typescript
// NEW: Query MindsDB agent
async function executeKBSearch(query: string) {
  const response = await fetch('http://127.0.0.1:47335/api/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        SELECT answer
        FROM crypto_auditor_agent
        WHERE question = '${query.replace(/'/g, "''")}';
      `
    })
  });
  
  if (!response.ok) {
    throw new Error(`MindsDB agent query failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  const answer = data.data?.[0]?.answer || '';
  
  // Parse answer into structured KB results if needed
  // Or return raw answer text
  return {
    results: [{ content: answer, relevance: 1.0, source: 'MindsDB Agent' }],
    duration: Date.now() - startTime
  };
}
```

---

## ✅ Complete Setup Checklist

- [ ] MindsDB running at `http://127.0.0.1:47334`
- [ ] KB verified with `SELECT COUNT(*) FROM web3_kb`
- [ ] KB queries work (test with metadata/relevance SELECT)
- [ ] MindsDB agent created (`CREATE AGENT crypto_auditor_agent`)
- [ ] Agent responds to queries (`SELECT answer FROM crypto_auditor_agent WHERE...`)
- [ ] Next.js dev server running (check port with `npm run dev` output)
- [ ] Price API working (`/api/prices`)
- [ ] Backend updated to call MindsDB agent
- [ ] Frontend tested end-to-end

---

## 🧪 Testing Commands

### Test MindsDB Agent (in MindsDB SQL Editor)

```sql
-- Test 1: Technical query
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'Explain Bitcoin proof of work';

-- Test 2: Another protocol
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'What is Ethereum consensus?';
```

### Test Next.js Backend (in PowerShell - update port if needed)

```powershell
# Check which port Next.js is running on first
# Look for "Local: http://localhost:XXXX" in npm run dev output

# Then test (replace 3000 with actual port):
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"What is Bitcoin consensus?"}'
```

### Test Price API

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/prices" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"projects":["bitcoin","ethereum"]}'
```

---

## 💡 Troubleshooting

### "Failed to connect to localhost:3001"
**Solution:** Check actual port from `npm run dev` output. Next.js often uses 3000, 3001, 3002 depending on availability.

### "Agent not found"
**Solution:** Run `SHOW AGENTS;` to see if agent was created. If not, re-run `CREATE AGENT` command.

### "KB query returns empty"
**Solution:** Don't select `content` column. Use only `metadata` and `relevance` due to DuckDB limitations.

### "API key error"
**Solution:** Replace `YOUR_GOOGLE_API_KEY_HERE` with actual Google API key in the `CREATE AGENT` command.

---

## 📞 Quick Reference

**MindsDB SQL Endpoint:** `http://127.0.0.1:47335/api/sql`
**MindsDB UI:** `http://127.0.0.1:47334`
**Next.js Backend:** `http://localhost:PORT` (check npm run dev output)

**Key SQL Commands:**
```sql
-- Create agent
CREATE AGENT crypto_auditor_agent USING model = {...}, data = {...};

-- Query agent  
SELECT answer FROM crypto_auditor_agent WHERE question = '...';

-- List agents
SHOW AGENTS;

-- Delete agent (if need to recreate)
DROP AGENT crypto_auditor_agent;
```

---

## 🎉 You're Done!

Once all checklist items pass, you have:
- ✅ MindsDB agent querying your knowledge base
- ✅ Next.js backend combining KB + price data
- ✅ Smart classification routing queries appropriately
- ✅ Full agent system ready for frontend integration

**Next step:** Update your frontend (`/app/page.tsx`) to use the unified `/api/agent/query` endpoint!
