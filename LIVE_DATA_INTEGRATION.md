# 🌐 Live Data Integration: Architecture & Implementation Plan

## Overview

Transform your Crypto Protocol Auditor from **static-only** to a **hybrid intelligent system** that combines:
- 📚 Static knowledge base (whitepapers)
- 💰 Live market data (prices, market cap, 24h volume)
- 📊 Combined insights (answering both "what is" and "what's the current status")

---

## 🎯 Use Cases We're Enabling

### Before Live Data Integration ❌
```
User: "What is Bitcoin and what's its current price?"
App: Returns only whitepaper info
Result: User gets protocol knowledge but missing market data
```

### After Live Data Integration ✅
```
User: "What is Bitcoin and what's its current price?"
App: 
  1. Searches knowledge base for protocol info
  2. Fetches live price data from API
  3. Returns combined response
Result: User gets complete picture of protocol + market
```

---

## 🏗️ Architecture Design

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│  Search Input → Combined Results Display                    │
│  Shows KB Results + Price Data in unified view              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         ↓                            ↓
    ┌─────────────┐          ┌──────────────┐
    │ /api/search │          │ /api/prices  │
    │ (existing)  │          │ (new)        │
    └──────┬──────┘          └──────┬───────┘
           │                        │
    ┌──────▼────────────┐   ┌───────▼──────────┐
    │   MindsDB         │   │  CoinGecko API   │
    │  Hybrid Search    │   │  (or similar)    │
    └──────┬────────────┘   └───────┬──────────┘
           │                        │
    ┌──────▼────────────┐   ┌───────▼──────────┐
    │  web3_kb          │   │  Live Price Data │
    │  (knowledge base) │   │  (JSON)          │
    └───────────────────┘   └──────────────────┘
```

### Data Flow

```
User Query: "What is Bitcoin's price and consensus mechanism?"
    ↓
[Frontend]
    ├─ Detect query mentions crypto (bitcoin)
    ├─ Extract project names/symbols
    └─ Send query to backend
    ↓
[Backend - /api/search]
    ├─ Hybrid search KB
    ├─ Get: Protocol info, consensus type, history
    └─ Return: KB results with relevance scores
    ↓
[Backend - /api/prices]
    ├─ Parse detected projects from query
    ├─ Fetch from CoinGecko: {price, marketcap, volume, 24h change}
    ├─ Cache results (5-minute TTL)
    └─ Return: Live market data
    ↓
[Frontend Combination]
    ├─ Display KB results: "Bitcoin uses PoW consensus..."
    ├─ Display Price: "Current BTC: $45,123.45 ↑ 5.2%"
    ├─ Show related data: Market cap, volume, etc.
    └─ User gets complete picture
```

---

## 🛠️ Implementation Approach

### Phase 1: Live Price API Route (New)

**File:** `/app/api/prices/route.ts`

**Purpose:** Fetch live crypto prices from external API

**Features:**
- Takes array of project IDs/symbols as input
- Fetches from CoinGecko free API (no auth needed)
- Caches results (5-minute TTL to avoid rate limits)
- Returns structured price data

**Input:**
```json
{
  "projects": ["bitcoin", "ethereum", "ripple"],
  "forceRefresh": false
}
```

**Output:**
```json
{
  "bitcoin": {
    "symbol": "BTC",
    "name": "Bitcoin",
    "price_usd": 45123.45,
    "market_cap_usd": 890000000000,
    "volume_24h_usd": 23000000000,
    "price_change_24h": 5.2,
    "price_change_7d": 12.5,
    "last_updated": "2025-10-31T12:34:56Z"
  },
  "ethereum": { ... },
  "ripple": { ... }
}
```

### Phase 2: MindsDB Agent (Optional but Recommended)

**Creates a MindsDB Agent that:**
- Takes natural language question
- Decides if live data is needed
- Executes KB search if needed
- Executes price lookup if needed
- Combines results intelligently

**Setup SQL:**
```sql
CREATE AGENT crypto_auditor_agent
USING
  model = openai_gpt4,
  skills = [
    knowledge_base_skill(web3_kb),
    text_to_sql_skill(projects_table),
    custom_skill(price_lookup)
  ];
```

### Phase 3: Combined Search Route (New)

**File:** `/app/api/search-combined/route.ts`

**Purpose:** Orchestrate KB search + price lookup

**Workflow:**
```
1. Parse query to extract project mentions
2. Run hybrid KB search
3. Fetch live prices for mentioned projects
4. Combine and enhance results
5. Return unified response
```

### Phase 4: Enhanced Frontend

**Updates to `/app/page.tsx`:**
- New "combined results" display mode
- Price cards showing live market data
- Link KB results to price data
- Toggle between KB-only and combined view

---

## 🔌 API Choice: CoinGecko vs Alternatives

### CoinGecko (Recommended) ✅
**Pros:**
- Free tier with no authentication
- 10-50 calls/minute rate limit
- ~150+ cryptocurrencies
- Historical data available
- Highly reliable

**Cons:**
- Rate limit requires caching
- Slightly slower (~500ms response)

**URL:** `https://api.coingecko.com/api/v3/simple/price`

### Alternative: CoinMarketCap
- Requires paid API key
- Higher rate limits
- More detailed data
- Better for production

### Alternative: Crypto.com
- Limited free tier
- Good data quality
- Requires registration

**Decision:** Start with **CoinGecko** (free, no setup needed)

---

## 📝 Implementation Steps (For You)

### Step 1: Create Price Lookup API Route ⏱️ 15-20 min

Create `/app/api/prices/route.ts`:

```typescript
export async function POST(request: Request) {
  const { projects, forceRefresh = false } = await request.json();
  
  // Map project names to CoinGecko IDs
  const coinGeckoMap = {
    'bitcoin': 'bitcoin',
    'ethereum': 'ethereum',
    'ripple': 'ripple',
    // ... add more
  };
  
  // Fetch prices from CoinGecko
  const ids = projects
    .map(p => coinGeckoMap[p.toLowerCase()])
    .filter(Boolean)
    .join(',');
    
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
```

### Step 2: Update Frontend to Detect Price Queries ⏱️ 10 min

In `/app/page.tsx`, add query analysis:

```typescript
const detectProjectsInQuery = (query: string): string[] => {
  const projects = [];
  const patterns = {
    'bitcoin': /\b(bitcoin|btc)\b/i,
    'ethereum': /\b(ethereum|eth)\b/i,
    'ripple': /\b(ripple|xrp)\b/i,
  };
  
  for (const [project, pattern] of Object.entries(patterns)) {
    if (pattern.test(query)) projects.push(project);
  }
  
  return projects;
};
```

### Step 3: Add Combined Search Logic ⏱️ 15 min

Update the search handler to fetch prices:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...
  
  try {
    // KB Search (existing)
    const kbResponse = await fetch('/api/search', { /* ... */ });
    const kbResults = await kbResponse.json();
    
    // NEW: Price Lookup
    const detectedProjects = detectProjectsInQuery(question);
    let priceData = null;
    
    if (detectedProjects.length > 0) {
      const priceResponse = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: detectedProjects }),
      });
      priceData = await priceResponse.json();
    }
    
    // Display both
    setResults({ kbResults, priceData });
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 4: Update Results Display ⏱️ 20 min

Add price cards to the UI:

```tsx
{priceData && (
  <div className="bg-slate-800 rounded-xl p-6 border border-green-500/50">
    <h3 className="text-xl font-bold text-green-400 mb-4">💰 Live Market Data</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(priceData).map(([coin, data]: any) => (
        <div key={coin} className="bg-slate-700 rounded-lg p-4">
          <p className="text-white font-bold">{data.name} ({data.symbol})</p>
          <p className="text-2xl font-bold text-green-400">${data.usd.toFixed(2)}</p>
          <p className={`text-sm ${data.usd_24h_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            24h: {data.usd_24h_change > 0 ? '+' : ''}{data.usd_24h_change.toFixed(2)}%
          </p>
          <p className="text-xs text-slate-400">Market Cap: ${(data.usd_market_cap / 1e9).toFixed(2)}B</p>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 📊 CoinGecko API Reference

### Endpoint
```
GET https://api.coingecko.com/api/v3/simple/price
```

### Parameters
```
?ids=bitcoin,ethereum,ripple
&vs_currencies=usd
&include_market_cap=true
&include_24hr_vol=true
&include_24hr_change=true
&include_7d_change=true
```

### Response Example
```json
{
  "bitcoin": {
    "usd": 45123.45,
    "usd_market_cap": 890000000000,
    "usd_24h_vol": 23000000000,
    "usd_24h_change": 5.2,
    "usd_7d_change": 12.5
  },
  "ethereum": {
    "usd": 2345.67,
    "usd_market_cap": 282000000000,
    "usd_24h_vol": 12000000000,
    "usd_24h_change": 3.8,
    "usd_7d_change": 8.2
  }
}
```

### Rate Limits
- Free: 10-50 calls/minute
- **Solution:** Cache results for 5 minutes

---

## 🔐 Caching Strategy (Important!)

To avoid rate limiting:

```typescript
// Simple in-memory cache
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedPrices = (projects: string[]) => {
  const now = Date.now();
  const cacheKey = projects.sort().join(',');
  
  if (priceCache.has(cacheKey)) {
    const { data, timestamp } = priceCache.get(cacheKey)!;
    if (now - timestamp < CACHE_TTL) {
      return data; // Return cached data
    }
  }
  
  return null; // Cache miss
};

const setCachedPrices = (projects: string[], data: any) => {
  const cacheKey = projects.sort().join(',');
  priceCache.set(cacheKey, { data, timestamp: Date.now() });
};
```

---

## 🎯 Advanced Features (Phase 2+)

### 1. Price Alerts
```typescript
// Alert if price changed >X% since last search
if (Math.abs(priceData.usd_24h_change) > 10) {
  showAlert(`⚠️ ${coin} price changed ${priceData.usd_24h_change}% in 24h`);
}
```

### 2. Historical Data
```typescript
// CoinGecko endpoint for historical data
https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=30
```

### 3. Comparison View
```typescript
// Show: KB result relevance vs price momentum
// User can decide: best protocol vs best performing asset
```

### 4. Trading Integration (Future)
```typescript
// Link to trading platforms: Buy BTC now
```

---

## ⚠️ Challenges & Solutions

| Challenge | Impact | Solution |
|-----------|--------|----------|
| Rate limiting | API blocks after 50 calls/min | Implement 5-min cache |
| Slow responses | User waits too long | Parallel fetch KB + prices |
| Missing projects | Can't lookup price | Provide fallback, show error |
| Price data stale | User sees old price | Show "updated X minutes ago" |
| API downtime | Service fails | Graceful degradation, cached fallback |

---

## 📈 Testing Scenarios

### Test 1: Simple Price Query
```
Query: "What is the price of Bitcoin?"
Expected: Price data fetched and displayed
Result: ✅ / ❌
```

### Test 2: Combined Query
```
Query: "Tell me about Bitcoin's consensus and current price"
Expected: KB results + price data combined
Result: ✅ / ❌
```

### Test 3: Multiple Projects
```
Query: "Compare Ethereum and Bitcoin prices"
Expected: Both prices fetched and displayed
Result: ✅ / ❌
```

### Test 4: Cache Test
```
Query: Same query twice within 1 minute
Expected: Second call uses cache (faster)
Result: ✅ / ❌
```

### Test 5: Invalid Project
```
Query: "What is XYZ coin's price?"
Expected: Graceful error, still shows KB results
Result: ✅ / ❌
```

---

## 🚀 Implementation Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Create `/api/prices` route | 15 min | 🟡 TODO |
| 2 | Add project detection | 10 min | 🟡 TODO |
| 3 | Integrate price fetch | 15 min | 🟡 TODO |
| 4 | Update UI display | 20 min | 🟡 TODO |
| 5 | Add caching logic | 10 min | 🟡 TODO |
| 6 | Test end-to-end | 20 min | 🟡 TODO |
| 7 | Error handling | 10 min | 🟡 TODO |
| 8 | Documentation | 15 min | 🟡 TODO |
| **Total** | | **115 min (~2 hours)** | |

---

## 📝 What You Need to Do

### Immediate Next Steps

1. **Review this document** (10 min)
   - Understand the architecture
   - Decide: Full implementation or simpler version?

2. **Decision Point** (Async answer)
   - Full implementation with caching + error handling?
   - Or simpler MVP first?

3. **Implementation** (Follow phases above)
   - Create price API route
   - Integrate with frontend
   - Test queries

---

## 🎓 MindsDB Agent Alternative (Advanced)

If you want MindsDB Agent approach instead:

```sql
-- Create Agent
CREATE AGENT crypto_assistant
USING
  model = {
    "provider": "openai",
    "model_name": "gpt-4",
    "api_key": "sk-xxx"
  },
  skills = [
    {
      "name": "kb_search",
      "type": "knowledge_base",
      "kb_name": "web3_kb"
    },
    {
      "name": "price_lookup",
      "type": "http",
      "url": "http://localhost:3001/api/prices"
    }
  ];

-- Query Agent
SELECT * FROM crypto_assistant WHERE query = 'What is Bitcoin price and consensus?';
```

**Pros:**
- Agent decides automatically if prices needed
- More intelligent orchestration
- Better for complex queries

**Cons:**
- More complex setup
- Requires OpenAI API key
- Slower (multiple LLM calls)

**Recommendation:** Start with **direct API approach** (simpler, faster), migrate to **Agent later** if needed.

---

## 📚 Files to Create/Modify

### New Files
```
/app/api/prices/route.ts ............. Price lookup API
```

### Modified Files
```
/app/page.tsx ........................ Add price display UI
/app/api/search/route.ts ............ Optional: add to combined response
```

### Documentation
```
LIVE_DATA_INTEGRATION.md ............. This implementation guide
```

---

## ✅ Success Criteria

Your live data integration is working when:

1. ✅ `/api/prices` endpoint returns live price data
2. ✅ Frontend detects project names in queries
3. ✅ Prices are fetched when relevant projects detected
4. ✅ Price data displayed in nice UI cards
5. ✅ Cache prevents rate limiting
6. ✅ Test query: "What is Bitcoin's price and consensus?" works
7. ✅ Multiple projects handled correctly
8. ✅ Graceful error handling for missing projects
9. ✅ No console errors
10. ✅ Performance is snappy (<3s total response)

---

## 🎉 Next After This

Once live data is working:
1. **Performance Evaluation** - Measure KB quality with metrics
2. **Advanced Filtering** - Filter by project, date, category
3. **Analytics Dashboard** - Track search patterns
4. **Production Deployment** - Host on cloud

---

## 💬 Questions to Answer Before Implementation

1. **API Choice?** CoinGecko (free) or CoinMarketCap (paid)?
2. **Caching?** 5-min TTL or different value?
3. **UI Integration?** Separate "Live Data" section or mixed with KB results?
4. **Agent Later?** Direct API now, MindsDB Agent in Phase 2?

Let me know your answers and we'll implement! 🚀
