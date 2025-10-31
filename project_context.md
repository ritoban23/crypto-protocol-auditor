# Google Gemini: Project Context

## Project: Crypto Protocol Auditor (MindsDB Hacktoberfest 2025)

### 1. Project Goal
To build a RAG (Retrieval-Augmented Generation) application that answers complex questions about Web3 protocols.  
It's unique because it combines:
- **Static technical data** (whitepapers)
- **Structured project data** (from a Postgres DB)
- **Live API data** (crypto prices)

The goal is to answer questions a generic LLM can't, like:
> “What is Bitcoin's consensus mechanism and what is its current price?”

---

### 2. Core Architecture
The project runs locally using **Docker Compose**, connecting to a cloud **Postgres** database.

**docker-compose.yml**
```yaml
version: '3.8'
services:
  mindsdb:
    image: mindsdb/mindsdb:latest
    pull_policy: always
    ports:
      - "47334:47334" # SQL
      - "47335:47335" # HTTP
    environment:
      - MINDSDB_CONFIG_CONTENT={"default_embedding_model": {"provider": "google", "mode
    volumes:
      - mindsdb_data:/var/lib/mindsdb

  pgvector_db:
    image: pgvector/pgvector:pg16
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_USER=mindsdb
      - POSTGRES_PASSWORD=mindsdb
      - POSTGRES_DB=mindsdb
    volumes:
      - pgvector_data:/var/lib/postgresql/data

volumes:
  mindsdb_data:
  pgvector_data:
```

> **Note:** The `MINDSDB_CONFIG_CONTENT` variable must include your Google AI key:  
> `{"default_embedding_model": {"provider": "google", "model_name": "text-embedding-004", "api_key": "AIza..."}}`

---

### 3. Data Sources

#### Structured Data (Neon Postgres)
A table named `projects` exists in a Neon-hosted Postgres DB.

```sql
CREATE TABLE projects (
    project_id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    token_ticker TEXT
);

INSERT INTO projects (project_id, name, category, token_ticker)
VALUES
    ('bitcoin', 'Bitcoin', 'L1', 'BTC'),
    ('ripple', 'Ripple', 'L1', 'XRP'),
    ('avalanche', 'Avalanche', 'L1', 'AVAX');
```

#### Unstructured Data (Local Files)
Three whitepapers were manually uploaded to MindsDB:
- `bitcoin.pdf` → `paper_btc`
- `ripple.pdf` → `paper_xrp`
- `avalanche.pdf` → `paper_avax`

---

### 4. MindsDB Setup (Executed SQL)

#### Step 1: Connect to PGVector
```sql
CREATE DATABASE pgvector_storage
WITH ENGINE = 'pgvector',
PARAMETERS = {
    "host": "pgvector_db",
    "port": 5432,
    "database": "mindsdb",
    "user": "mindsdb",
    "password": "mindsdb"
};
```

#### Step 2: Connect to Neon DB
```sql
CREATE DATABASE postgres_db
WITH ENGINE = 'postgres',
PARAMETERS = {
    "host": "ep-soft-shadow-a1llt0p3-pooler.ap-southeast-1.aws.neon.tech",
    "port": 5432,
    "database": "neondb",
    "user": "neondb_owner",
    "password": "USER_NEON_PASSWORD",
    "sslmode": "require"
};
```

#### Step 3: Connect to Files Engine
```sql
CREATE DATABASE file_storage
WITH ENGINE = 'files';
```

#### Step 4: Create Knowledge Base
```sql
DROP KNOWLEDGE_BASE IF EXISTS web3_kb;

CREATE KNOWLEDGE_BASE web3_kb
USING
  embedding_model = {
    "provider": "google",
    "model_name": "text-embedding-004",
    "api_key": "USER_GOOGLE_AI_KEY"
  },
  storage = pgvector_storage.whitepaper_storage,
  id_column = 'doc_id',
  metadata_columns = [
    'project_id', 
    'category', 
    'source_file', 
    'project_name', 
    'token_ticker'
  ],
  preprocessing = {
    "text_chunking_config": {"chunk_size": 2000, "chunk_overlap": 200}
  };
```

#### Step 5: Insert Data into KB
```sql
-- Bitcoin Whitepaper
INSERT INTO web3_kb (...)
SELECT 'doc_btc_paper', 'bitcoin_whitepaper.pdf', 'bitcoin', 'L1', p.content
FROM file_storage.paper_btc AS p;

-- Ripple Whitepaper
INSERT INTO web3_kb (...)
SELECT 'doc_xrp_paper', 'ripple_whitepaper.pdf', 'ripple', 'L1', p.content
FROM file_storage.paper_xrp AS p;

-- Avalanche Whitepaper
INSERT INTO web3_kb (...)
SELECT 'doc_avax_paper', 'avalanche_whitepaper.pdf', 'avalanche', 'L1', p.content
FROM file_storage.paper_avax AS p;

-- Structured Data from Neon
INSERT INTO web3_kb (...)
SELECT
  project_id, 'Neon DB Projects', name, category, token_ticker,
  name || ' is an ' || category || ' project with ticker ' || token_ticker AS content
FROM postgres_db.projects;
```

---

### 5. Application Code

#### `/app/api/search/route.ts`
Connects to MindsDB via HTTP and queries KB:

```ts
import MindsDB from 'mindsdb-js-sdk';
import { NextResponse } from 'next/server';

const connectToMindsDB = async () => {
  try {
    await MindsDB.connect({
      host: 'http://127.0.0.1:47335',
      user: '',
      password: ''
    });
  } catch (error) {
    console.error('Failed to connect:', error);
    return false;
  }
  return true;
};

export async function POST(request: Request) {
  const { question } = await request.json();
  if (!question) return NextResponse.json({ error: 'No question provided' }, { status: 400 });

  if (!(await connectToMindsDB()))
    return NextResponse.json({ error: 'Failed to connect to MindsDB' }, { status: 500 });

  try {
    const query = `
      SELECT metadata, relevance
      FROM mindsdb.web3_kb
      WHERE content = '${question}'
      LIMIT 10;
    `;
    const result = await MindsDB.SQL.runQuery(query);
    return NextResponse.json(result.rows ?? []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### `/app/page.tsx`
Renders results from metadata:

```tsx
'use client';
import { useState } from 'react';

type SearchResult = { metadata: any; relevance: number };

export default function Home() {
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch results');
      setResults(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Crypto Protocol Auditor 🤖</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does Bitcoin's proof-of-work function?"
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 p-3 bg-blue-600 text-white font-semibold rounded-lg"
        >
          {isLoading ? 'Auditing...' : 'Ask'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-2xl space-y-4">
        {results.map((result, index) => {
          const meta = result.metadata;
          let sourceText = meta?.source_file || "Unknown";
          let displayText = meta?.project_name ? `Project: ${meta.project_name}` : `Whitepaper: ${meta.project_id}`;

          return (
            <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow">
              <p className="text-sm text-gray-800 mb-2"><strong>{displayText}</strong></p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-mono bg-gray-100 p-1 rounded">Source: {sourceText}</span>
                <span className="text-xs font-semibold text-green-700">Relevance: {(result.relevance * 100).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
```

---

### 6. Frontend Implementation

**Frontend Tech Stack:**
- Next.js 16 with Turbopack
- React hooks (useState)
- TailwindCSS for styling
- Modern dark theme with gradient accents

**Key Components:**
- Search input with autocomplete suggestions
- Results grid with relevance badges
- Metadata display (source, category, chunk index)
- Color-coded relevance scores (Green >80%, Blue >70%, Yellow <70%)
- Loading state with animations
- Error handling with user-friendly messages

**Data Flow:**
1. User enters question in search input
2. Form submission calls POST `/api/search`
3. Backend queries MindsDB with semantic search
4. Backend parses JSON metadata and converts relevance to number
5. Results displayed with full metadata and relevance percentage

---

### 7. Current Status

**✅ Completed:**
- Semantic search implementation working correctly
- Beautiful modern UI with dark theme
- Proper metadata parsing from MindsDB
- Git repository initialized and configured
- API and frontend error handling

**🚧 In Progress:**
- Implementing Hybrid Search (semantic + keyword/BM25)

---

### 8. Hybrid Search Implementation

**What is Hybrid Search?**
Hybrid search combines:
- **Semantic Search**: Finds conceptually similar content using embeddings
- **Keyword Search (BM25)**: Finds exact matches using full-text index
- **Result**: Best of both worlds - catches concepts + specific terms

**Why Hybrid Search for Crypto Protocol Auditor?**
1. Users search for acronyms (BTC, ETH, POW) → keyword search needed
2. Users ask natural language questions ("explain proof-of-work") → semantic needed
3. Combined gives best results for all query types
4. Better recall for technical terminology in whitepapers

**Implementation Plan:**
1. Add search mode toggle UI (Semantic / Keyword / Hybrid)
2. Update `/api/search/route.ts` to accept `searchMode` and `alpha` parameters
3. Modify SQL query to use `USING hybrid_search = true, hybrid_search_alpha = ${alpha}`
4. Display search mode indicator in results
5. Show relevance scores for both semantic and keyword matching
6. Adaptive alpha: auto-detect query type and adjust balance

**Alpha Parameter (Hybrid Balance):**
- `0` = Pure keyword search (BM25 only)
- `0.5` = Balanced (default)
- `1` = Pure semantic search (embeddings only)

**Recommended Settings:**
- Acronyms/IDs: `alpha = 0.2` (favor keyword matching)
- Natural language: `alpha = 0.7` (favor semantic matching)
- Mixed queries: `alpha = 0.5` (balanced)

---

### 9. Live Data Integration (In Progress)

**What is Live Data Integration?**
Combines static KB search with live market data:
- User: "What is Bitcoin's price and consensus?"
- App returns: KB results (protocol info) + live prices
- User gets: Complete picture of both technical and market aspects

**Architecture:**
1. **Price API** (`/app/api/prices/route.ts`): Fetches from CoinGecko
2. **Frontend Integration**: Detects projects in query, fetches prices
3. **Caching Strategy**: 5-minute TTL to prevent rate limiting
4. **Combined Results**: Shows KB results + price data together

**Implementation Status:**
- ✅ Price API route created and tested
- ✅ CoinGecko integration with 12+ cryptocurrencies
- ✅ Caching mechanism implemented
- ✅ Architecture documentation complete
- 🟡 Frontend integration (in your hands)
- 🟡 Testing (next step)

**Next Actions:**
1. Choose implementation path (Quick: 1h vs Learning: 2-3h)
2. Follow `FRONTEND_IMPLEMENTATION_GUIDE.md`
3. Test with combined queries
4. Commit changes

---

### 10. Next Steps

1. **Live Data Integration - Frontend** (current task)
   - Integrate price data into search UI
   - Test with various queries
   - Commit implementation

2. **Advanced Filtering** (Phase 3)
   - Filter by project_id
   - Filter by date range
   - Filter by category

3. **Performance Evaluation** (Phase 3)
   - Use `EVALUATE KNOWLEDGE_BASE` metrics
   - Track MRR, Hit@k scores
   - Optimize search quality
