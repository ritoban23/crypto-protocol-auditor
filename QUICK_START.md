# 🚀 Quick Start Guide

Get the Crypto Protocol Auditor running in 5 minutes.

---

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **Docker** & **Docker Compose** ([install](https://docs.docker.com/compose/install/))
- **News API Key** (free tier at [newsapi.org](https://newsapi.org))

---

## 1️⃣ Clone & Install (2 min)

```bash
git clone https://github.com/ritoban23/crypto-protocol-auditor.git
cd crypto-protocol-auditor
cd crypto-auditor-app
npm install
```

---

## 2️⃣ Start Infrastructure (3 min)

In a **new terminal**, from project root:

```bash
docker-compose up -d
```

This starts:
- **MindsDB** on `http://127.0.0.1:47334`
- **PostgreSQL** with PGVector on `localhost:5432`

Wait 30 seconds for services to be ready.

---

## 3️⃣ Configure Environment

Create `crypto-auditor-app/.env.local`:

```env
# Required: Get free key from https://newsapi.org
NEWS_API_KEY=your_api_key_here

# Optional (defaults shown)
NEXT_PUBLIC_API_BASE=http://localhost:3000
MINDSDB_HOST=127.0.0.1
MINDSDB_PORT=47334
```

---

## 4️⃣ Run Development Server

```bash
cd crypto-auditor-app
npm run dev
```

Output:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
- Environments: .env.local
```

---

## 5️⃣ Open in Browser

Navigate to: **http://localhost:3000** ✅

You should see:
- 🔐 **Header**: "Crypto Protocol Auditor"
- 🔍 **Search box**: "Ask about any crypto protocol"
- 🟡 **Empty state cards**: Sentiment Badges, Recent News, Protocol Comparison

---

## ✅ Verify Setup

### Test Search
Try these queries:

1. **KB-Only**: "What is Bitcoin consensus mechanism?"
2. **Price-Only**: "What is Ethereum's current price?"
3. **Combined**: "Tell me about Bitcoin and its price"

Expected: 
- Instant response (<2s for combined)
- KB content + live prices + sentiment badge 📈

### Test MindsDB (Optional)

Open `http://127.0.0.1:47334` (MindsDB SQL Editor)

Run:
```sql
SELECT COUNT(*) as docs FROM web3_kb;
```

Expected: `docs: 1000+` ✅

---

## 🚀 You're Ready!

The app is fully functional:

✅ Dark theme + Gruppo font applied  
✅ Sentiment analysis integrated  
✅ Live prices from CoinGecko  
✅ Protocol comparison available  
✅ 40+ cryptocurrencies supported

---

## 📌 Common Issues

| Problem | Solution |
|---------|----------|
| Port 3000 busy | Change in `package.json` or use port from output |
| MindsDB not responding | Wait 30s, check `docker ps`, run `docker logs` |
| News API error | Verify key in `.env.local`, activate account at newsapi.org |
| Dark theme not showing | Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) |

---

## 📚 Next Steps

- **Learn more**: See `README.md` for features & architecture
- **See roadmap**: Check `ROADMAP.md` for upcoming features
- **Deploy**: Ready for production build with `npm run build`

---

**Questions?** Check the GitHub Issues or review `README.md`.

Happy auditing! 🎉
