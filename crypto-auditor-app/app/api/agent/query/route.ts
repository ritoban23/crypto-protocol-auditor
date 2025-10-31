import { NextRequest, NextResponse } from 'next/server';

// Types
interface QueryContext {
  searchMode?: 'auto' | 'kb_only' | 'price_only' | 'combined';
  maxResults?: number;
  timeout?: number;
}

interface KBResult {
  content: string;
  relevance: number;
  metadata: {
    _source?: string;
    category?: string;
    chunk_index?: number;
    row_index?: number;
  };
  source: string;
  searchMode: string;
}

interface PriceResult {
  project: string;
  price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  price_change_24h: number;
  price_change_7d: number;
  last_updated: string;
}

interface AgentResponse {
  queryId: string;
  originalQuery: string;
  classifiedAs: 'kb_only' | 'price_only' | 'combined' | 'auto';
  results: {
    kb_results?: KBResult[];
    price_results?: PriceResult[];
    kbSearchComplete: boolean;
    priceSearchComplete: boolean;
  };
  executedAt: {
    kb_search_ms: number;
    price_fetch_ms: number;
    total_ms: number;
  };
  agentReasoning: string;
}

// ============================================================
// AGENT CLASSIFICATION LOGIC
// ============================================================

/**
 * Classify query into: kb_only, price_only, combined, or auto
 */
function classifyQuery(query: string): {
  type: 'kb_only' | 'price_only' | 'combined' | 'auto';
  reasoning: string;
  detectedProjects: string[];
} {
  const lowerQuery = query.toLowerCase();

  // Price-related keywords
  const priceKeywords = [
    'price',
    'cost',
    'worth',
    'market',
    'trading',
    'bullish',
    'bearish',
    'chart',
    'volume',
    'marketcap',
    'market cap',
    'usd',
    'expensive',
  ];

  // Technical/Protocol keywords
  const technicalKeywords = [
    'consensus',
    'whitepaper',
    'protocol',
    'algorithm',
    'mechanism',
    'network',
    'validation',
    'mining',
    'stake',
    'hash',
    'block',
    'transaction',
    'security',
    'cryptography',
    'smart contract',
    'proof of work',
    'proof of stake',
    'Byzantine',
  ];

  // Crypto project names and symbols
  const projectPatterns: { [key: string]: string } = {
    bitcoin: 'bitcoin',
    btc: 'bitcoin',
    ethereum: 'ethereum',
    eth: 'ethereum',
    solana: 'solana',
    sol: 'solana',
    cardano: 'cardano',
    ada: 'cardano',
    polkadot: 'polkadot',
    dot: 'polkadot',
    ripple: 'ripple',
    xrp: 'ripple',
    litecoin: 'litecoin',
    ltc: 'litecoin',
    dogecoin: 'dogecoin',
    doge: 'dogecoin',
    polygon: 'polygon',
    matic: 'polygon',
    arbitrum: 'arbitrum',
    arb: 'arbitrum',
    optimism: 'optimism',
    op: 'optimism',
  };

  // Detect projects mentioned in query
  const detectedProjects: string[] = [];
  for (const [key, project] of Object.entries(projectPatterns)) {
    if (lowerQuery.includes(key)) {
      if (!detectedProjects.includes(project)) {
        detectedProjects.push(project);
      }
    }
  }

  // Count keyword occurrences
  const priceKeywordCount = priceKeywords.filter((kw) =>
    lowerQuery.includes(kw)
  ).length;
  const technicalKeywordCount = technicalKeywords.filter((kw) =>
    lowerQuery.includes(kw)
  ).length;

  // Classification logic
  if (priceKeywordCount > 0 && technicalKeywordCount > 0) {
    return {
      type: 'combined',
      reasoning: `Query contains both price terms (${priceKeywordCount}) and technical terms (${technicalKeywordCount}). Executing both KB search and price fetch.`,
      detectedProjects,
    };
  }

  if (priceKeywordCount > 0) {
    return {
      type: 'price_only',
      reasoning: `Query contains ${priceKeywordCount} price-related keywords. Fetching live price data.`,
      detectedProjects,
    };
  }

  if (technicalKeywordCount > 0) {
    return {
      type: 'kb_only',
      reasoning: `Query contains ${technicalKeywordCount} technical keywords. Searching knowledge base.`,
      detectedProjects,
    };
  }

  if (detectedProjects.length > 0) {
    return {
      type: 'auto',
      reasoning: `Detected crypto project mentions (${detectedProjects.join(', ')}). Using adaptive detection.`,
      detectedProjects,
    };
  }

  return {
    type: 'auto',
    reasoning: 'No clear classification. Using adaptive mode.',
    detectedProjects: [],
  };
}

// ============================================================
// KB SEARCH EXECUTION
// ============================================================

async function executeKBSearch(
  query: string,
  maxResults: number = 5
): Promise<{ results: KBResult[]; duration: number }> {
  const startTime = Date.now();

  try {
    // Determine adaptive alpha based on query type
    const adaptive = classifyQuery(query);
    let alpha = 0.7; // default
    if (adaptive.type === 'price_only') alpha = 0.3;
    else if (adaptive.type === 'combined') alpha = 0.5;

    const response = await fetch('http://127.0.0.1:47335/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          SELECT 
            content,
            relevance,
            metadata
          FROM web3_kb
          WHERE content LIKE '%${query.split(/\s+/).slice(0, 3).join('%')}%'
            AND hybrid_search = true
            AND hybrid_search_alpha = ${alpha}
          ORDER BY relevance DESC
          LIMIT ${maxResults};
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`MindsDB query failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results: KBResult[] = (data.data || []).map((row: any) => ({
      content: row.content || '',
      relevance:
        typeof row.relevance === 'string'
          ? parseFloat(row.relevance)
          : row.relevance,
      metadata:
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : row.metadata,
      source: row.metadata?._source || 'Unknown Source',
      searchMode: alpha === 0.7 ? 'semantic' : alpha === 0.3 ? 'keyword' : 'hybrid',
    }));

    const duration = Date.now() - startTime;
    return { results, duration };
  } catch (error) {
    console.error('KB Search Error:', error);
    return { results: [], duration: Date.now() - startTime };
  }
}

// ============================================================
// PRICE FETCH EXECUTION
// ============================================================

async function executePriceFetch(
  projects: string[]
): Promise<{ results: PriceResult[]; duration: number }> {
  const startTime = Date.now();

  try {
    if (!projects || projects.length === 0) {
      return { results: [], duration: 0 };
    }

    const response = await fetch('http://localhost:3001/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projects,
        forceRefresh: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Price API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Transform to PriceResult format
    const results: PriceResult[] = (data.prices || []).map((price: any) => ({
      project: price.project,
      price_usd: price.price_usd,
      market_cap_usd: price.market_cap_usd,
      volume_24h_usd: price.volume_24h_usd,
      price_change_24h: price.price_change_24h,
      price_change_7d: price.price_change_7d,
      last_updated: price.last_updated,
    }));

    return { results, duration };
  } catch (error) {
    console.error('Price Fetch Error:', error);
    return { results: [], duration: Date.now() - startTime };
  }
}

// ============================================================
// MAIN AGENT HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const queryId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { query, context = {} as QueryContext } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Classify the query
    const classification = classifyQuery(query);
    const searchMode = context.searchMode || classification.type;
    const maxResults = context.maxResults || 5;

    console.log(`[Agent ${queryId}] Query: "${query}"`);
    console.log(`[Agent ${queryId}] Classification: ${classification.type}`);
    console.log(`[Agent ${queryId}] Detected Projects: ${classification.detectedProjects.join(', ') || 'none'}`);

    // Execute based on classification
    let kbResults: KBResult[] = [];
    let kbDuration = 0;
    let priceResults: PriceResult[] = [];
    let priceDuration = 0;

    // Determine what to execute
    const executeKB =
      searchMode === 'kb_only' ||
      searchMode === 'combined' ||
      (searchMode === 'auto' && classification.type !== 'price_only');
    const executePrice =
      searchMode === 'price_only' ||
      searchMode === 'combined' ||
      (searchMode === 'auto' && classification.detectedProjects.length > 0);

    // Execute in parallel for speed
    const [kbResult, priceResult] = await Promise.all([
      executeKB ? executeKBSearch(query, maxResults) : Promise.resolve({ results: [], duration: 0 }),
      executePrice ? executePriceFetch(classification.detectedProjects) : Promise.resolve({ results: [], duration: 0 }),
    ]);

    kbResults = kbResult.results;
    kbDuration = kbResult.duration;
    priceResults = priceResult.results;
    priceDuration = priceResult.duration;

    const totalDuration = Date.now() - startTime;

    // Build response
    const response: AgentResponse = {
      queryId,
      originalQuery: query,
      classifiedAs: classification.type,
      results: {
        kb_results: kbResults.length > 0 ? kbResults : undefined,
        price_results: priceResults.length > 0 ? priceResults : undefined,
        kbSearchComplete: executeKB,
        priceSearchComplete: executePrice,
      },
      executedAt: {
        kb_search_ms: kbDuration,
        price_fetch_ms: priceDuration,
        total_ms: totalDuration,
      },
      agentReasoning: classification.reasoning,
    };

    console.log(`[Agent ${queryId}] Response ready in ${totalDuration}ms`);
    console.log(`[Agent ${queryId}] KB Results: ${kbResults.length}, Price Results: ${priceResults.length}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[Agent Error] ${error}`);
    return NextResponse.json(
      { 
        error: 'Agent processing failed',
        queryId,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    agent: 'crypto-auditor-agent-v1',
    capabilities: ['kb_search', 'price_fetch', 'query_classification', 'parallel_execution'],
    endpoints: {
      query_endpoint: 'POST /api/agent/query',
      kb_only: 'POST /api/agent/query with context.searchMode="kb_only"',
      price_only: 'POST /api/agent/query with context.searchMode="price_only"',
      combined: 'POST /api/agent/query with context.searchMode="combined"',
      auto: 'POST /api/agent/query with context.searchMode="auto" (default)',
    },
  });
}
