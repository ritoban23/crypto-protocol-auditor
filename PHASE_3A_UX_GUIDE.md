# Phase 3a: User Experience Guide

## Main Search Page - Enhanced with Sentiment & News

### Search Result Example: "What is Bitcoin?"

```
┌─────────────────────────────────────────────────────────────┐
│ 🔐 Crypto Protocol Auditor                    [Home] [Compare]
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Search input: Ask about crypto...]                  [🔍 Search]
│                                                               │
│ 🤖 Query Classification: 📚 Knowledge Base + 💰 Live Prices  │
│ Agent Reasoning: Detected crypto mentions (bitcoin)          │
│ KB: 354ms | Prices: 66ms | Total: 367ms                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ 📚 KNOWLEDGE BASE RESULTS (1)                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🤖 AI Agent Response    🟢 bullish (10%)                    │
│                                                               │
│ Bitcoin: A Peer-to-Peer Electronic Cash System              │
│ Satoshi Nakamoto                                             │
│ satoshin@gmx.com                                             │
│ www.bitcoin.org                                              │
│ Abstract. A purely peer-to-peer version of electronic cash... │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💬 Market Sentiment Summary                              │ │
│ │ The news headlines present a mixed sentiment towards     │ │
│ │ Bitcoin. While some articles highlight positive         │ │
│ │ developments like easier payments and acceptance by      │ │
│ │ businesses, others point to price plunges and           │ │
│ │ regulatory scrutiny. Overall neutral with slight bias.   │ │
│ │ Confidence: 70% | Based on 20 articles                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 📰 RECENT NEWS                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📰 New Bitcoin Protocol Makes Payments Easier       →   │ │
│ │     Gizmodo.com • Oct 31                                 │ │
│ │                                                          │ │
│ │ 📰 Bitcoin Hits All-Time High Amid ETF Adoption    →   │ │
│ │     CoinDesk • Oct 30                                    │ │
│ │                                                          │ │
│ │ 📰 Institutional Investors Surge on BTC Holdings   →   │ │
│ │     Bloomberg • Oct 30                                   │ │
│ │                                                          │ │
│ │ 📰 Regulatory Clarity Boosts Bitcoin Confidence   →    │ │
│ │     Reuters • Oct 29                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Relevance: ████████████████████ 100%                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparison Page - Complete with Prices

### Multiple Protocol Comparison: "bitcoin,ethereum,ripple"

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔐 Crypto Protocol Auditor                     [Home] [Compare] │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Select Protocols to Compare:                                     │
│ [⊗ Bitcoin] [⊗ Ethereum] [⊗ Ripple] [+ Add]        [🔄 Compare]│
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                      PROTOCOL COMPARISON                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ BITCOIN 🟢 bullish                                                │
│ ├─ Price: $109,717 USD                                           │
│ ├─ Market Cap: $2.19 Trillion                                    │
│ ├─ 24h Volume: $64.67 Billion                                    │
│ ├─ 24h Change: +1.09%                                            │
│ ├─ Category: L1                                                  │
│ └─ Consensus: Proof-of-Work                                      │
│                                                                    │
│ ETHEREUM 🟡 neutral                                               │
│ ├─ Price: $3,840.91 USD                                          │
│ ├─ Market Cap: $463.27 Billion                                   │
│ ├─ 24h Volume: $34.04 Billion                                    │
│ ├─ 24h Change: +0.38%                                            │
│ ├─ Category: L1                                                  │
│ └─ Consensus: Proof-of-Stake                                     │
│                                                                    │
│ RIPPLE 🟢 bullish                                                 │
│ ├─ Price: $2.51 USD                                              │
│ ├─ Market Cap: $150.40 Billion                                   │
│ ├─ 24h Volume: $4.96 Billion                                     │
│ ├─ 24h Change: +0.32%                                            │
│ ├─ Category: L1                                                  │
│ └─ Consensus: Byzantine Consensus                                │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│ 🤖 AI COMPARISON SUMMARY                                          │
│                                                                    │
│ Bitcoin, Ethereum, and Ripple represent distinct approaches      │
│ within the cryptocurrency landscape. Bitcoin operates as a       │
│ decentralized peer-to-peer electronic cash system, secured by    │
│ a proof-of-work consensus mechanism. Ripple is designed for      │
│ payment settlement with focus on cross-border transfers.         │
│ Ethereum enables smart contracts and decentralized apps with     │
│ proof-of-stake consensus...                                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Sentiment Badge Colors

### Visual Indicators

```
BULLISH SENTIMENT (🟢 Green)
├─ Background: Green with 30% opacity (bg-green-900/30)
├─ Border: Green at 50% opacity (border-green-500/50)
├─ Text: Bright green (text-green-300)
├─ Icon: 🟢 Green circle
├─ Meaning: Positive market outlook
└─ Example: "🟢 bullish (60%)"

NEUTRAL SENTIMENT (🟡 Yellow)  
├─ Background: Yellow with 30% opacity (bg-yellow-900/30)
├─ Border: Yellow at 50% opacity (border-yellow-500/50)
├─ Text: Bright yellow (text-yellow-300)
├─ Icon: 🟡 Yellow circle
├─ Meaning: Mixed or uncertain outlook
└─ Example: "🟡 neutral (10%)"

BEARISH SENTIMENT (🔴 Red)
├─ Background: Red with 30% opacity (bg-red-900/30)
├─ Border: Red at 50% opacity (border-red-500/50)
├─ Text: Bright red (text-red-300)
├─ Icon: 🔴 Red circle
├─ Meaning: Negative market outlook
└─ Example: "🔴 bearish (30%)"
```

---

## Data Flow Diagram

```
User Search
    ↓
[Search Input] "What is Bitcoin?"
    ↓
handleSubmit()
    ├─→ /api/agent/query
    │   ├─→ MindsDB Agent
    │   │   ├─→ KB Search (354ms) → Bitcoin whitepaper
    │   │   └─→ Price Fetch (66ms) → $109,717
    │   └─→ Returns: AgentResponse with KB + Prices
    │
    └─→ Extract Project Name
        └─→ "bitcoin" detected
            ↓
        sentimentCache State Loop
            ├─→ /api/sentiment?project=bitcoin&days=7
            │   ├─→ Query crypto_news database
            │   ├─→ Analyze 20 articles
            │   ├─→ Calculate sentiment score
            │   └─→ Return: {sentiment, score, news[], summary}
            │
            └─→ setState(sentimentCache)
                ↓
        Render Results
            ├─→ KB Content
            ├─→ SentimentBadge (🟢 bullish)
            ├─→ Sentiment Summary
            ├─→ NewsItem[] (up to 4 articles)
            └─→ Relevance Indicator
```

---

## Component Hierarchy

```
<Home>
├─ <Header>
│  ├─ Title & Logo
│  ├─ Navigation [Home | Compare]
│  └─ Subtitle
│
├─ <SearchForm>
│  ├─ <TextInput>
│  └─ <SearchButton>
│
├─ <AgentInfoBanner>
│  ├─ Classification badge
│  ├─ Agent reasoning
│  └─ Execution times
│
├─ <KBResultsSection>
│  └─ {agentResponse.results.kb_results.map((result, idx) => (
│      <ResultCard key={idx}>
│      ├─ <AIResponseHeader>
│      │  ├─ Icon
│      │  ├─ Title
│      │  └─ <SentimentBadge>  ← NEW
│      │     ├─ Icon (🟢/🟡/🔴)
│      │     ├─ Text (bullish/neutral/bearish)
│      │     └─ Score (XX%)
│      │
│      ├─ <ResponseContent>
│      │  └─ KB text
│      │
│      ├─ <SentimentSummary>  ← NEW
│      │  ├─ Summary text
│      │  ├─ Confidence
│      │  └─ Article count
│      │
│      ├─ <NewsSection>  ← NEW
│      │  └─ {recentNews.slice(0,4).map((article) => (
│      │     <NewsItem>
│      │     ├─ Icon (📰)
│      │     ├─ Title (link)
│      │     ├─ Source
│      │     ├─ Date
│      │     └─ External link (→)
│      │  ))}
│      │
│      └─ <RelevanceBar>
│         └─ Progress indicator
│  ))}
│
└─ <PriceResultsSection>
   ├─ Section title
   └─ Price cards with full data
```

---

## Performance Timeline

```
0ms   ├─ User types search query
      │
50ms  ├─ User clicks search button
      │  handleSubmit() called
      │
100ms ├─ Fetch initiated to /api/agent/query
      │
454ms ├─ Response received (354ms KB + 66ms Prices + 34ms misc)
      │  KB Results displayed
      │  Project name extraction begins
      │
500ms ├─ Sentiment fetch started for "bitcoin"
      │
2500ms├─ Sentiment response received (2s first call)
      │  sentimentCache updated
      │  Component re-renders
      │
3000ms├─ Full results displayed with badges + news ✅
      │  (subsequent searches: <100ms for sentiment)
```

---

## Mobile Responsive Behavior

```
DESKTOP (1024px+)              TABLET (768px)              MOBILE (320px)
┌──────────────────────┐     ┌────────────────┐           ┌─────────┐
│ Title    [Nav Btns]  │     │ Title [Btns]   │           │ Title   │
├──────────────────────┤     ├────────────────┤           │ [Btns]  │
│ [Search Full Width]  │     │ [Search FW]    │           ├─────────┤
│                      │     │                │           │[Search] │
│ 🤖 Agent Banner      │     │ 🤖 Banner      │           │         │
│                      │     │ (stacked)      │           │🤖 Banner│
├──────────────────────┤     ├────────────────┤           ├─────────┤
│ 📚 KB Results        │     │ 📚 KB Results  │           │📚 Results
│ ┌────────────────┐   │     │ ┌──────────┐   │           │┌───────┐
│ │ Badge: 🟢 50%  │   │     │ │Badge: 🟢 │   │           ││🟢 50% │
│ │ Content...     │   │     │ │Content   │   │           ││Content
│ │ Summary...     │   │     │ │Summary   │   │           ││Summary
│ │ News (4 items)│   │     │ │News (3i) │   │           ││News(2)
│ └────────────────┘   │     │ └──────────┘   │           │└───────┘
│                      │     │                │           │
│ 💰 Prices            │     │ 💰 Prices      │           │💰 Prices
│ ┌────────────────┐   │     │ ┌──────────┐   │           │
│ │ BTC: $109k     │   │     │ │BTC: $109k│   │           │
│ │ ETH: $3,840    │   │     │ │ETH: $3.8 │   │           │
│ └────────────────┘   │     │ └──────────┘   │           │
└──────────────────────┘     └────────────────┘           └─────────┘
```

---

## User Interaction Flow

```
1. USER SEARCHES
   Input: "What is Bitcoin?"
   Action: Click [Search]
   
2. PAGE RESPONDS
   Visual: Loading spinner ⚙️
   Message: "Agent Processing..."
   Time: ~5 seconds
   
3. RESULTS APPEAR
   A. KB Content loads first
   B. Sentiment badge appears (cached: <100ms)
   C. Sentiment summary displays
   D. Recent news populates
   E. Price data shows
   
4. USER INTERACTIONS
   a) Click news headline → Opens external article (target="_blank")
   b) Hover over result → Border changes to purple/glow
   c) Hover over news item → Highlight and show arrow
   d) Click [Compare] button → Navigate to comparison page
   
5. DATA UPDATES
   Auto-refresh: Every 5 minutes for prices
   Sentiment cache: 1 hour TTL
   News articles: Fetched fresh each search
```

---

## API Response Format

### /api/agent/query Response Structure
```json
{
  "queryId": "q_1761916157136_omd7t9ig6",
  "originalQuery": "What is Bitcoin?",
  "classifiedAs": "auto",
  "results": {
    "kb_results": [{
      "content": "Bitcoin: A Peer-to-Peer Electronic...",
      "relevance": 1,
      "metadata": {
        "_source": "bitcoin_whitepaper.pdf",
        "category": "L1"
      },
      "source": "Knowledge Base"
    }],
    "price_results": [{
      "project": "bitcoin",
      "price_usd": 109717,
      "market_cap_usd": 2186711542209.657,
      "volume_24h_usd": 64665007357.34017,
      "price_change_24h": 1.0877791920658768
    }]
  },
  "executedAt": {
    "kb_search_ms": 354,
    "price_fetch_ms": 66,
    "total_ms": 367
  }
}
```

### /api/sentiment Response Structure
```json
{
  "sentiment": "bullish",
  "score": 0.6,
  "confidence": 0.8,
  "summary": "Mixed positive sentiment...",
  "newsCount": 20,
  "recentNews": [
    {
      "title": "New Bitcoin Protocol Makes Payments Easier",
      "description": "...",
      "source_name": "Gizmodo.com",
      "url": "https://...",
      "publishedAt": "2025-10-31T10:30:00Z"
    }
  ]
}
```

---

**Status:** 🎉 Phase 3a Complete - All features fully integrated and tested
**Deployment:** Production ready
**Documentation:** Complete
