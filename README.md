# 🔐 Crypto Protocol Auditor

**AI-Powered Cryptocurrency Intelligence Platform**  
Built with Next.js, MindsDB, and modern fintech design.

---

## 📚 Documentation Quick Links

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[KB_EVALUATION.md](./KB_EVALUATION.md)** - KB metrics & evaluation tools
- **[ROADMAP.md](./ROADMAP.md)** - Feature roadmap & future plans

---

## 🎯 What It Does

**Hybrid Search** combines knowledge base, live prices, and sentiment analysis in one query:
- 📚 **Knowledge Base**: 1300+ characters of technical protocol information
- 💰 **Live Prices**: Real-time CoinGecko data (price, market cap, 24h change)
- 📈 **Sentiment Analysis**: Market mood (bullish/bearish/neutral) from latest news
- 🔀 **Protocol Comparison**: Side-by-side analysis of 2-5 protocols

---

## ✨ Features (Phase 3a - Complete)

✅ **AI-Powered Search**
- Hybrid search: semantic + keyword combining
- Auto-classification: KB-only, prices-only, or combined queries
- Query timing metrics (KB ms, price ms, total ms)

✅ **Real-Time Market Data**
- Live prices via CoinGecko API (40+ cryptos)
- Market cap, volume, 24h/7d price changes
- 5-minute cache for performance

✅ **Sentiment & News Intelligence**
- AI sentiment analysis (Gemini) on latest news
- Recent articles with sources and dates
- Bullish/bearish/neutral confidence scores
- 1-hour sentiment caching

✅ **Protocol Comparison**
- Compare 2-5 protocols side-by-side
- Combined technical info + live prices + sentiment
- Comparison summaries from AI

✅ **Modern UI**
- **Dark theme** with fintech design tokens
- **Gruppo font** for all typography
- **Sentiment badges** (🟢 bullish, 🔴 bearish, 🟡 neutral)
- **Responsive cards** for desktop & mobile
- **Loading states** and error handling

---

## 🏗️ Architecture

```
crypto-protocol-auditor/
├── crypto-auditor-app/           # Next.js frontend + API routes
│   ├── app/
│   │   ├── page.tsx              # Main search UI (dark theme, Gruppo font)
│   │   ├── layout.tsx            # Root layout with Gruppo import
│   │   ├── globals.css           # Global styles (dark variables, fonts)
│   │   ├── compare/
│   │   │   └── page.tsx          # Protocol comparison page
│   │   └── api/
│   │       ├── agent/query       # Hybrid search orchestration
│   │       ├── prices/           # Live CoinGecko prices
│   │       ├── sentiment/        # News + sentiment analysis
│   │       ├── compare/          # Protocol comparison
│   │       └── search/           # MindsDB KB search
│   └── package.json
├── docker-compose.yml             # MindsDB + PGVector services
├── kb_evaluate.py                 # Basic KB evaluation tool
├── advanced_kb_evaluate.py        # Advanced KB evaluation (MRR, NDCG, etc)
├── KB_EVALUATION.sql              # MindsDB test queries
├── QUICK_START.md                 # Setup instructions (5 min)
├── KB_EVALUATION.md               # KB metrics & evaluation guide
└── ROADMAP.md                    # Feature roadmap
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- News API key (get free at [newsapi.org](https://newsapi.org))

### Setup (5 minutes)

**1. Clone & Install**
```bash
git clone https://github.com/ritoban23/crypto-protocol-auditor.git
cd crypto-auditor-app
npm install
```

**2. Start Infrastructure**
```bash
cd ..
docker-compose up -d
```
This starts:
- MindsDB (port 47334)
- PGVector database (port 5432)

**3. Configure Environment**

Create `.env.local` in `crypto-auditor-app/`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
NEWS_API_KEY=your_key_here
MINDSDB_HOST=127.0.0.1
MINDSDB_PORT=47334
```

**4. Run Development Server**
```bash
cd crypto-auditor-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

---

## 📊 API Reference

### Search Hybrid Results
**POST** `/api/agent/query`
```json
{
  "query": "What is Bitcoin and its current price?",
  "context": { "searchMode": "auto", "maxResults": 5 }
}
```

**Response**:
```json
{
  "queryId": "uuid",
  "classifiedAs": "combined",
  "results": {
    "kb_results": [{ "content": "...", "relevance": 0.95 }],
    "price_results": [{ "project": "bitcoin", "price_usd": 109717, ... }]
  },
  "executedAt": { "kb_search_ms": 354, "price_fetch_ms": 66, "total_ms": 367 }
}
```

### Get Sentiment Analysis
**GET** `/api/sentiment?project=bitcoin&days=7`

**Response**:
```json
{
  "sentiment": "bullish",
  "score": 0.78,
  "confidence": 0.92,
  "summary": "...",
  "newsCount": 42,
  "recentNews": [{ "title": "...", "url": "...", "publishedAt": "..." }]
}
```

### Get Live Prices
**POST** `/api/prices`
```json
{ "projects": ["bitcoin", "ethereum"] }
```

### Compare Protocols
**GET** `/api/compare?projects=bitcoin,ethereum,ripple`

---

## 🎨 Design System

**Colors** (Dark Mode):
- Primary: `#6C5CE7` (purple)
- Success: `#00D084` (green)
- Error: `#FF3B30` (red)
- Info: `#0A84FF` (blue)
- Backgrounds: `#0F1419`, `#1A1F26` (dark surfaces)

**Typography**:
- All text: **Gruppo** (display font)
- Imported from Google Fonts

---

## 📈 Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| KB search | 200-500ms | Semantic + keyword hybrid |
| Price fetch | 50-900ms | CoinGecko API |
| Sentiment (first) | 2-5s | API + AI analysis |
| Sentiment (cached) | <100ms | 1-hour TTL |
| Combined query | 8-16s | KB + prices parallel |

---

## 🔄 Current Status

**Phase 3a Complete** ✅
- Dark theme UI finalized
- Gruppo font applied globally
- Sentiment badges integrated
- Recent news section added
- All 40+ crypto protocols supported

**Next**: Phase 3b improvements (autocomplete, query history, mobile UX)

---

## 📝 Environment Variables

```env
# Next.js / Client
NEXT_PUBLIC_API_BASE=http://localhost:3000

# APIs
NEWS_API_KEY=your_newsapi_key_here

# MindsDB
MINDSDB_HOST=127.0.0.1
MINDSDB_PORT=47334

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_kb

# Optional
DEBUG=false
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to remote: `git push origin feature/my-feature`
4. Open a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

- Issues: GitHub Issues
- Docs: See `QUICK_START.md` and `ROADMAP.md`
- MindsDB Setup: `QUICK_START.md` Step 2

---

**Last Updated**: October 31, 2025 | Phase 3a UI Complete
