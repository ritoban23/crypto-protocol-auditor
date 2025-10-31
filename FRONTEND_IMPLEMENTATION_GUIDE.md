# 🎨 Live Data Integration: Frontend Implementation Guide

## What We're Doing

Updating your frontend to:
1. Detect crypto projects mentioned in queries
2. Fetch live price data for those projects
3. Display prices alongside KB search results
4. Show beautiful price cards with 24h changes

---

## Step-by-Step Implementation

### Step 1: Add Types & Constants

At the top of `/app/page.tsx`, add:

```typescript
// Types
type SearchMode = 'semantic' | 'keyword' | 'hybrid';

type SearchResult = {
  metadata: {
    _source?: string;
    category?: string;
    project_id?: string;
    project_name?: string;
    source_file?: string;
    _chunk_index?: number;
    _original_doc_id?: string;
    _start_char?: number;
    _end_char?: number;
    _created_at?: string;
    _updated_at?: string;
    _original_row_index?: string;
    _content_column?: string;
    [key: string]: any;
  };
  relevance: number;
  searchMode?: 'semantic' | 'keyword' | 'hybrid';
};

type PriceData = {
  [project: string]: {
    name: string;
    symbol: string;
    price_usd: number;
    market_cap_usd: number;
    volume_24h_usd: number;
    price_change_24h: number;
    price_change_7d?: number;
    last_updated: string;
    status: string;
  };
};

// Project detection patterns
const PROJECT_PATTERNS: Record<string, RegExp> = {
  'bitcoin': /\b(bitcoin|btc)\b/gi,
  'ethereum': /\b(ethereum|eth)\b/gi,
  'ripple': /\b(ripple|xrp)\b/gi,
  'avalanche': /\b(avalanche|avax)\b/gi,
  'cardano': /\b(cardano|ada)\b/gi,
  'solana': /\b(solana|sol)\b/gi,
};
```

### Step 2: Add Helper Functions

Before the component, add:

```typescript
/**
 * Detect cryptocurrency projects mentioned in the query
 */
const detectProjectsInQuery = (query: string): string[] => {
  const detected = new Set<string>();
  
  for (const [project, pattern] of Object.entries(PROJECT_PATTERNS)) {
    if (pattern.test(query)) {
      detected.add(project);
    }
  }
  
  return Array.from(detected);
};

/**
 * Format price change with color
 */
const getPriceChangeColor = (change: number): string => {
  if (change > 5) return 'text-green-400';
  if (change > 0) return 'text-green-300';
  if (change < -5) return 'text-red-400';
  if (change < 0) return 'text-red-300';
  return 'text-slate-300';
};

/**
 * Format large numbers to readable format
 */
const formatMarketCap = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
};
```

### Step 3: Update Component State

In the component, update the state:

```typescript
export default function Home() {
  const [question, setQuestion] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null); // NEW
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(true); // NEW - show/hide prices
```

### Step 4: Update the Search Handler

Replace the existing `handleSubmit` function:

```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setPriceData(null); // NEW: Clear previous price data

    try {
      const alpha = getAdaptiveAlpha(question);
      
      // Parallel fetch: KB search + Price lookup
      const [kbResponse, priceResponse] = await Promise.all([
        // KB Search (existing)
        fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, searchMode, alpha }),
        }),
        // NEW: Price lookup if projects detected
        (async () => {
          const detectedProjects = detectProjectsInQuery(question);
          if (detectedProjects.length === 0) return null;
          
          try {
            const response = await fetch('/api/prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projects: detectedProjects }),
            });
            
            if (response.ok) {
              const result = await response.json();
              return result.data;
            }
          } catch (err) {
            console.warn('Price fetch warning:', err);
          }
          return null;
        })(),
      ]);

      // Handle KB search response
      if (!kbResponse.ok) {
        const err = await kbResponse.json();
        throw new Error(err.error || 'Failed to fetch results');
      }

      const kbData = await kbResponse.json();
      console.log('KB Results:', kbData);
      console.log('Price Data:', priceResponse);
      
      setResults(kbData);
      
      // NEW: Set price data if available
      if (priceResponse) {
        setPriceData(priceResponse);
      }
      
    } catch (err: any) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };
```

### Step 5: Create Price Display Component

Add this before the main return statement:

```typescript
  // Render price data section
  const renderPriceData = () => {
    if (!priceData || Object.keys(priceData).length === 0) return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">💰</span>
          <h2 className="text-2xl font-bold">
            Live Market Data
            <span className="text-green-400 ml-2">({Object.keys(priceData).length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(priceData).map(([projectKey, data]) => (
            <div
              key={projectKey}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-850 border border-green-500/30 hover:border-green-400/60 rounded-lg p-6 transition duration-300 hover:shadow-xl hover:shadow-green-500/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{data.name}</h3>
                  <p className="text-sm text-slate-400">{data.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">${data.price_usd.toFixed(2)}</p>
                </div>
              </div>

              {/* 24h Change */}
              <div className="mb-4 pb-4 border-b border-slate-700">
                <p className={`text-lg font-bold ${getPriceChangeColor(data.price_change_24h)}`}>
                  {data.price_change_24h > 0 ? '📈 +' : '📉 '}
                  {Math.abs(data.price_change_24h).toFixed(2)}%
                  <span className="text-sm text-slate-400 ml-2">(24h)</span>
                </p>
                {data.price_change_7d !== null && (
                  <p className={`text-sm ${getPriceChangeColor(data.price_change_7d)}`}>
                    {data.price_change_7d > 0 ? '📈 +' : '📉 '}
                    {Math.abs(data.price_change_7d).toFixed(2)}%
                    <span className="text-slate-400"> (7d)</span>
                  </p>
                )}
              </div>

              {/* Market Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Market Cap</p>
                  <p className="text-sm font-bold text-white">{formatMarketCap(data.market_cap_usd)}</p>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-slate-400 uppercase font-semibold">24h Volume</p>
                  <p className="text-sm font-bold text-white">{formatMarketCap(data.volume_24h_usd)}</p>
                </div>
              </div>

              {/* Last Updated */}
              <p className="text-xs text-slate-500 mt-3 text-right">
                Updated: {new Date(data.last_updated).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };
```

### Step 6: Update the Main Return JSX

Update your render to include the price section. Find the section that renders results and add the price data before KB results:

```typescript
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ... Header stays the same ... */}

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ... Search Section stays the same ... */}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-700 text-red-200 px-6 py-4 rounded-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* NEW: Price Data Section */}
        {!isLoading && priceData && renderPriceData()}

        {/* Results Section (existing KB results) */}
        {results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-bold">
                Search Results
                <span className="text-cyan-400 ml-2">({results.length})</span>
              </h2>
              {results.length > 0 && (
                <span className="text-sm text-slate-400 ml-4">
                  Using: <span className="text-cyan-300 font-semibold">{results[0]?.searchMode || searchMode}</span> search
                </span>
              )}
            </div>

            {/* ... Rest of KB results rendering stays the same ... */}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && !priceData && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Start Your Search</h3>
            <p className="text-slate-400">Ask about crypto protocols, prices, or anything blockchain-related.</p>
          </div>
        )}
      </div>
    </main>
  );
```

---

## Testing the Integration

### Test 1: Simple Price Query
```
Query: "What is the price of Bitcoin?"
Expected: Price card appears with BTC price, market cap, 24h change
```

### Test 2: Combined Query
```
Query: "Tell me about Bitcoin's consensus mechanism and current price"
Expected: KB results + price card both appear
```

### Test 3: Multiple Projects
```
Query: "Compare Ethereum and Bitcoin"
Expected: Price cards for both ETH and BTC appear
```

### Test 4: Cache Test
```
Query: Same query twice within 1 minute
Expected: Second query faster (shows "cache" in console)
```

### Test 5: No Prices Detected
```
Query: "What is blockchain?"
Expected: Only KB results appear, no price data
```

---

## Debugging Tips

### Check Console Logs
```javascript
// In browser console (F12 → Console)
// Look for:
"✅ Cache hit for: bitcoin"  // Cache working
"📡 Fetching from CoinGecko"  // Fresh fetch
"✅ Successfully fetched prices for 1 projects"  // Success
```

### Check Network Tab
```
F12 → Network tab
Look for: POST /api/prices
Response should show price data as JSON
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Price not appearing | Check if project name detected in query |
| Network error | Verify CoinGecko API is accessible |
| Slow response | First request takes time (10-15 items) |
| Old price data | Check cache time (should update every 5 min) |

---

## Advanced Features (Optional)

### 1. Toggle Price Display

Add button to show/hide prices:

```typescript
<button
  onClick={() => setShowPrices(!showPrices)}
  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
>
  {showPrices ? '💰 Hide' : '💰 Show'} Prices
</button>
```

### 2. Price Alerts

Show warning if price changed significantly:

```typescript
{data.price_change_24h > 10 && (
  <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-200 text-xs">
    ⚠️ Large 24h change: {data.price_change_24h.toFixed(2)}%
  </div>
)}
```

### 3. Link to Exchange

Add "Buy Now" buttons:

```typescript
<a 
  href={`https://www.coingecko.com/en/coins/${projectKey}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 block text-center bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
>
  📈 View on CoinGecko
</a>
```

---

## Files Modified

```
crypto-auditor-app/app/page.tsx
├─ Added: Price types and constants
├─ Added: Project detection functions
├─ Added: Price formatting helpers
├─ Modified: State to include priceData
├─ Modified: handleSubmit for parallel fetch
├─ Added: renderPriceData component
└─ Updated: Main return JSX
```

---

## Next Steps

1. **Implementation** (45-60 min)
   - Add types and constants
   - Add helper functions
   - Update component state
   - Update search handler
   - Add price display component

2. **Testing** (15 min)
   - Test with price queries
   - Test with combined queries
   - Check console logs
   - Verify cache working

3. **Commit** (5 min)
   - Git add and commit with message
   - Push to repository

4. **Enhancement** (optional)
   - Add price alerts
   - Add exchange links
   - Fine-tune styling

---

## Success Indicators

✅ Price cards appear when project detected
✅ All 3 search modes still work
✅ Cache prevents rate limiting
✅ No console errors
✅ Combined queries show KB + prices
✅ Relevant projects detected from queries
✅ Prices update every 5 minutes
✅ Beautiful UI with proper colors/spacing

Ready to implement? Let's go! 🚀
