'use client';

import { useState } from 'react';

// Agent API Response types
type SearchResult = {
  content: string;
  relevance: number;
  metadata: {
    _source?: string;
    category?: string;
    [key: string]: any;
  };
  source: string;
  searchMode?: string;
};

type PriceResult = {
  project: string;
  price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  price_change_24h: number;
  price_change_7d: number;
  last_updated: string;
};

type SentimentData = {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  summary: string;
  newsCount: number;
  recentNews?: Array<{
    title: string;
    description: string;
    source_name?: string;
    url: string;
    publishedAt: string;
  }>;
};

type AgentResponse = {
  queryId: string;
  originalQuery: string;
  classifiedAs: 'kb_only' | 'price_only' | 'combined' | 'auto';
  results: {
    kb_results?: SearchResult[];
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
};

/**
 * Extract project name from KB result content
 */
function extractProjectName(content: string): string | null {
  const projectKeywords: { [key: string]: string } = {
    bitcoin: 'bitcoin',
    ethereum: 'ethereum',
    ripple: 'ripple',
    xrp: 'ripple',
    avalanche: 'avalanche',
    cardano: 'cardano',
    polkadot: 'polkadot',
    solana: 'solana',
    polygon: 'polygon',
    arbitrum: 'arbitrum',
  };

  for (const [keyword, projectName] of Object.entries(projectKeywords)) {
    if (content.toLowerCase().includes(keyword)) {
      return projectName;
    }
  }
  return null;
}

/**
 * Sentiment Badge Component
 */
function SentimentBadge({ sentiment, score, confidence }: { sentiment: string; score: number; confidence: number }) {
  const getColors = () => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-500/50', icon: '🟢' };
      case 'bearish':
        return { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-500/50', icon: '🔴' };
      default:
        return { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-500/50', icon: '🟡' };
    }
  };

  const colors = getColors();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
      <span className="text-sm">{colors.icon}</span>
      <span className={`text-sm font-semibold ${colors.text} capitalize`}>
        {sentiment}
      </span>
      <span className={`text-xs ${colors.text}`}>
        ({(score * 100).toFixed(0)}%)
      </span>
    </div>
  );
}

/**
 * Recent News Item Component
 */
function NewsItem({ article }: { article: any }) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <a
      href={article.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block group hover:bg-slate-700/50 p-3 rounded transition duration-200"
    >
      <div className="flex items-start gap-2">
        <span className="text-sm text-slate-400 mt-0.5 shrink-0">📰</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-300 group-hover:text-white line-clamp-2 transition">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">
              {article.source_name || 'News'}
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-500">
              {formatDate(article.publishedAt)}
            </span>
          </div>
        </div>
        <span className="text-slate-400 group-hover:text-slate-300 shrink-0">→</span>
      </div>
    </a>
  );
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentimentCache, setSentimentCache] = useState<Record<string, SentimentData>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAgentResponse(null);

    try {
      const response = await fetch('/api/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: question,
          context: {
            searchMode: 'auto', // Let agent decide
            maxResults: 5,
          }
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch results');
      }

      const data: AgentResponse = await response.json();
      console.log('Agent Response:', data);
      setAgentResponse(data);
      
      // Fetch sentiment data for each KB result's project
      if (data.results.kb_results && data.results.kb_results.length > 0) {
        const projectNames = data.results.kb_results
          .map(r => extractProjectName(r.content))
          .filter((p): p is string => p !== null);
        
        // Deduplicate and fetch sentiment for each project
        const uniqueProjects = Array.from(new Set(projectNames));
        for (const project of uniqueProjects) {
          try {
            const sentimentRes = await fetch(`/api/sentiment?project=${project}&days=7`);
            if (sentimentRes.ok) {
              const sentimentData = await sentimentRes.json();
              setSentimentCache(prev => ({
                ...prev,
                [project]: sentimentData
              }));
            }
          } catch (err) {
            console.error(`Failed to fetch sentiment for ${project}:`, err);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Crypto Protocol Auditor
              </h1>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300">Home</a>
              <a href="/compare" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">Compare</a>
            </nav>
          </div>
          <p className="text-slate-400 text-sm">AI-powered hybrid search system for blockchain & crypto protocol knowledge</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-slate-800 rounded-xl p-6">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about crypto protocols or prices... e.g., What is Bitcoin's proof-of-work? What is Ethereum's price?"
                  className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin">⚙️</span>
                      Agent Processing...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-700 text-red-200 px-6 py-4 rounded-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Agent Info Banner */}
        {agentResponse && (
          <div className="mb-6 bg-linear-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-300">Query Classification:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    agentResponse.classifiedAs === 'kb_only' ? 'bg-purple-600 text-white' :
                    agentResponse.classifiedAs === 'price_only' ? 'bg-green-600 text-white' :
                    agentResponse.classifiedAs === 'combined' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {agentResponse.classifiedAs === 'kb_only' && '📚 Knowledge Base'}
                    {agentResponse.classifiedAs === 'price_only' && '💰 Live Prices'}
                    {agentResponse.classifiedAs === 'combined' && '🔀 Combined Search'}
                    {agentResponse.classifiedAs === 'auto' && '🔍 Auto'}
                  </span>
                </div>
                {agentResponse.agentReasoning && (
                  <p className="text-sm text-slate-400">{agentResponse.agentReasoning}</p>
                )}
              </div>
              {agentResponse.executedAt && (
                <div className="text-xs text-slate-500">
                  <div>KB: {agentResponse.executedAt.kb_search_ms}ms</div>
                  <div>Prices: {agentResponse.executedAt.price_fetch_ms}ms</div>
                  <div>Total: {agentResponse.executedAt.total_ms}ms</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Base Results Section */}
        {agentResponse?.results.kb_results && agentResponse.results.kb_results.length > 0 && (
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h2 className="text-2xl font-bold">
                Knowledge Base Results
                <span className="text-cyan-400 ml-2">({agentResponse.results.kb_results.length})</span>
              </h2>
            </div>

            <div className="grid gap-4">
              {agentResponse.results.kb_results.map((result, index) => {
                const projectName = extractProjectName(result.content);
                const sentiment = projectName ? sentimentCache[projectName] : null;
                
                return (
                  <div
                    key={index}
                    className="group relative bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-lg p-6 transition duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">🤖</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-white">AI Agent Response</h3>
                          {sentiment && (
                            <SentimentBadge
                              sentiment={sentiment.sentiment}
                              score={sentiment.score}
                              confidence={sentiment.confidence}
                            />
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.content}</p>
                      </div>
                    </div>
                    
                    {/* Sentiment Summary */}
                    {sentiment && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="mb-4">
                          <p className="text-sm text-slate-400 mb-2">💬 Market Sentiment Summary</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{sentiment.summary}</p>
                          <div className="mt-2 text-xs text-slate-500">
                            Confidence: {(sentiment.confidence * 100).toFixed(0)}% | Based on {sentiment.newsCount} articles
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Recent News Section */}
                    {sentiment && sentiment.recentNews && sentiment.recentNews.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-sm font-semibold text-slate-300 mb-3">📰 Recent News</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sentiment.recentNews.slice(0, 4).map((article, idx) => (
                            <NewsItem key={idx} article={article} />
                          ))}
                        </div>
                      </div>
                    )}
                  
                    {result.relevance && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Relevance:</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-linear-to-r ${
                                result.relevance > 0.8 ? 'from-green-500 to-emerald-500' :
                                result.relevance > 0.6 ? 'from-blue-500 to-cyan-500' :
                                'from-yellow-500 to-orange-500'
                              }`}
                              style={{ width: `${result.relevance * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-cyan-400">{(result.relevance * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Results Section */}
        {agentResponse?.results.price_results && agentResponse.results.price_results.length > 0 && (
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h2 className="text-2xl font-bold">
                Live Price Data
                <span className="text-cyan-400 ml-2">({agentResponse.results.price_results.length})</span>
              </h2>
              <span className="text-xs text-slate-400 ml-2">
                Source: CoinGecko API
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {agentResponse.results.price_results.map((price, index) => (
                <div
                  key={index}
                  className="group relative bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-green-500/50 rounded-lg p-6 transition duration-300 hover:shadow-xl hover:shadow-green-500/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white capitalize">{price.project}</h3>
                    {price.price_change_24h !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        price.price_change_24h >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {price.price_change_24h >= 0 ? '↑' : '↓'} {Math.abs(price.price_change_24h).toFixed(2)}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {price.price_usd !== undefined && (
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1">💵 Price (USD)</p>
                        <p className="text-2xl font-bold text-green-400">${price.price_usd.toLocaleString()}</p>
                      </div>
                    )}

                    {price.market_cap_usd !== undefined && (
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1">📊 Market Cap</p>
                        <p className="text-sm font-mono text-white">${(price.market_cap_usd / 1e9).toFixed(2)}B</p>
                      </div>
                    )}
                  </div>

                  {price.last_updated && (
                    <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                      Updated: {new Date(price.last_updated).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !agentResponse && !error && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Start Your Search</h3>
            <p className="text-slate-400">Ask about crypto protocols, request live prices, or combine both!</p>
            <div className="mt-6 grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-cyan-400 font-semibold mb-2">📚 Knowledge Base</p>
                <p className="text-xs text-slate-400">&quot;How does Bitcoin proof-of-work function?&quot;</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-green-400 font-semibold mb-2">💰 Live Prices</p>
                <p className="text-xs text-slate-400">&quot;What is Ethereum&apos;s current price?&quot;</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-blue-400 font-semibold mb-2">🔀 Combined</p>
                <p className="text-xs text-slate-400">&quot;Tell me about Bitcoin and its price&quot;</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
