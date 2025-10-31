# 🚀 Quick Start: MindsDB Agent Setup

## Current Status
✅ Backend `/api/agent/query` and `/api/prices` created
✅ Frontend hybrid search UI ready
🔄 MindsDB agent needs to be created (SQL commands ready)

---

## Step 1: Find Your Next.js Port (1 min)

```powershell
cd "c:\Users\KIIT\Desktop\crypto protocol auditor\crypto-auditor-app"
npm run dev
```

Look for output like:
```
▲ Next.js 15.x
- Local: http://localhost:3000
- Network: http://192.168.x.x:3000
```

**Your port is:** 3000 (or 3001, 3002 if 3000 is busy)

---

## Step 2: Create MindsDB Agent (5 min)

**Open:** `http://127.0.0.1:47334` (MindsDB SQL Editor)

**Paste and run:**

```sql
-- Step 2.1: Verify KB exists
SELECT COUNT(*) as total_docs FROM web3_kb;
```

Expected: `total_docs: 1000+` ✅

**Then run:**

```sql
-- Step 2.2: Test KB query (no content column - DuckDB limitation)
SELECT 
    relevance,
    metadata
FROM web3_kb
WHERE metadata LIKE '%Bitcoin%'
LIMIT 3;
```

Expected: 3 rows with relevance scores ✅

**Finally, create the agent:**

```sql
-- Step 2.3: Create agent (REPLACE YOUR_API_KEY)
CREATE AGENT crypto_auditor_agent
USING
    model = {
        "provider": "google",
        "model_name": "gemini-2.0-flash",
        "api_key": "AIzaSyBTRdxDRy5ii22Gc7iykczL013nOpYwwJM"
    },
    data = {
        "knowledge_bases": ["mindsdb.web3_kb"]
    },
    prompt_template='
        You are a crypto protocol auditor assistant.
        The knowledge base contains cryptocurrency whitepapers and technical docs.
        Answer technical questions precisely using the knowledge base.
        If asked about prices, say you only have technical data.
    ',
    timeout=30;
```

Expected: `Agent crypto_auditor_agent created successfully` ✅

---

## Step 3: Test the Agent (3 min)

**In MindsDB SQL Editor:**

```sql
-- Test query
SELECT answer
FROM crypto_auditor_agent
WHERE question = 'What is Bitcoin proof of work?';
```

Expected: Detailed answer about PoW ✅

---

## Step 4: Test Backend (2 min)

**In PowerShell (replace 3000 with your port from Step 1):**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"What is Bitcoin consensus?"}'
```

**If this fails with connection error:**
- Check `npm run dev` is running
- Verify the port number (3000 vs 3001 vs 3002)
- Try `http://127.0.0.1:PORT` instead of `localhost`

Expected: JSON response with `kb_results` ✅

---

## Step 5: Update Backend to Use MindsDB Agent (10 min)

**Edit:** `crypto-auditor-app/app/api/agent/query/route.ts`

**Find the function:** `executeKBSearch`

**Replace the MindsDB query from:**
```typescript
query: `SELECT content, relevance, metadata FROM web3_kb WHERE...`
```

**To:**
```typescript
query: `
  SELECT answer
  FROM crypto_auditor_agent
  WHERE question = '${query.replace(/'/g, "''")}';
`
```

**Update the response parsing:**
```typescript
const data = await response.json();
const answer = data.data?.[0]?.answer || '';

return {
  results: [{
    content: answer,
    relevance: 1.0,
    metadata: { _source: 'MindsDB Agent' },
    source: 'MindsDB Agent',
    searchMode: 'agent'
  }],
  duration: Date.now() - startTime
};
```

---

## Step 6: Test End-to-End (5 min)

**Test in PowerShell:**

```powershell
# Test 1: KB-only
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"What is Ethereum smart contract?"}'

# Test 2: Price-only
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"What is Bitcoin price?"}'

# Test 3: Combined
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"Tell me about Bitcoin and its current price"}'
```

---

## ✅ Success Checklist

- [ ] MindsDB agent created and responds to queries
- [ ] Next.js dev server running (port noted)
- [ ] Backend connects to MindsDB agent successfully
- [ ] Price API working
- [ ] All 3 test queries return correct classifications
- [ ] Ready for frontend integration

---

## 🐛 Common Issues

**Issue:** "Failed to connect to localhost:3001"
**Fix:** Check actual port from `npm run dev` output. Use that port in curl/Invoke-RestMethod.

**Issue:** "Agent not found"
**Fix:** Run `SHOW AGENTS;` in MindsDB SQL Editor. If empty, re-run `CREATE AGENT` command.

**Issue:** "Cannot read property 'answer'"
**Fix:** Check MindsDB SQL query response format. Add console.log to see raw response.

**Issue:** "API key error"
**Fix:** Replace `YOUR_GOOGLE_API_KEY_HERE` with real Google API key in CREATE AGENT.

---

## 📚 Full Documentation

See **MINDSDB_AGENT_GUIDE.md** for complete details, troubleshooting, and advanced configuration.
