'use client';

import { useState } from 'react';

// API Response type - metadata is a JSON object from MindsDB
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

type SearchMode = 'semantic' | 'keyword' | 'hybrid';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect query type and suggest adaptive alpha
  const getAdaptiveAlpha = (query: string): number => {
    // Patterns that benefit from keyword search
    const hasAcronyms = /[A-Z]{2,}|BTC|ETH|POW|PoW|PoS/i.test(query);
    const hasNumbers = /\d{3,}/.test(query);
    const hasSpecificTerms = /whitepaper|consensus|algorithm|protocol/i.test(query);
    
    if (hasAcronyms || hasNumbers) {
      return 0.3; // Favor keyword matching for IDs/acronyms
    } else if (hasSpecificTerms) {
      return 0.7; // Favor semantic matching for conceptual terms
    }
    return 0.5; // Balanced for mixed queries
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const alpha = getAdaptiveAlpha(question);
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          searchMode,
          alpha, // Send adaptive alpha to backend
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch results');
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      if (data.length > 0) {
        console.log('First result:', JSON.stringify(data[0], null, 2));
      }
      setResults(data);
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
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔐</span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Crypto Protocol Auditor
            </h1>
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
                {/* Search Mode Selector */}
                <div className="mb-4 flex gap-2 flex-wrap">
                  <label className="text-sm text-slate-300 font-semibold self-center">Search Mode:</label>
                  {(['semantic', 'keyword', 'hybrid'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSearchMode(mode)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        searchMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      {mode === 'semantic' && ' 🧠'}
                      {mode === 'keyword' && ' 🔤'}
                      {mode === 'hybrid' && ' 🔀'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about crypto protocols... e.g., How does Bitcoin's proof-of-work function?"
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
                      Auditing Knowledge Base...
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

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-bold">
                Results
                <span className="text-cyan-400 ml-2">({results.length})</span>
              </h2>
              {results.length > 0 && (
                <span className="text-sm text-slate-400 ml-4">
                  Using: <span className="text-cyan-300 font-semibold">{results[0]?.searchMode || searchMode}</span> search
                </span>
              )}
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => {
                // Parse metadata object from MindsDB response
                const meta = result.metadata;
                
                // Extract source file
                const sourceText = meta?.source_file || meta?._original_doc_id || "Unknown Source";
                
                // Extract project info
                const projectName = meta?.project_name || meta?.project_id || "Unknown Project";
                
                // Extract category
                const category = meta?.category || "N/A";
                
                // Extract chunk index
                const chunkIndex = meta?._chunk_index !== undefined ? meta._chunk_index : null;
                
                // Calculate relevance percentage
                const relevancePercent = (result.relevance * 100).toFixed(1);
                const relevanceColor = 
                  result.relevance > 0.8 ? 'from-green-500 to-emerald-500' :
                  result.relevance > 0.7 ? 'from-blue-500 to-cyan-500' :
                  'from-yellow-500 to-orange-500';

                return (
                  <div
                    key={index}
                    className="group relative bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 transition duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                  >
                    {/* Search Mode Badge */}
                    <div className={`absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded-full ${
                      result.searchMode === 'semantic' ? 'bg-purple-900/50 text-purple-200' :
                      result.searchMode === 'keyword' ? 'bg-orange-900/50 text-orange-200' :
                      'bg-blue-900/50 text-blue-200'
                    }`}>
                      {result.searchMode === 'semantic' && '🧠 Semantic'}
                      {result.searchMode === 'keyword' && '🔤 Keyword'}
                      {result.searchMode === 'hybrid' && '🔀 Hybrid'}
                    </div>

                    {/* Relevance Badge */}
                    <div className={`absolute top-4 right-4 bg-linear-to-r ${relevanceColor} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                      {relevancePercent}%
                    </div>

                    {/* Result Number & Project */}
                    <div className="mb-4 pr-40 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-cyan-400 text-lg font-bold">#{index + 1}</span>
                        <h3 className="text-xl font-bold text-white">{projectName}</h3>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Source */}
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">📄 Source</p>
                        <p className="text-white font-mono text-sm truncate">{sourceText}</p>
                      </div>

                      {/* Category */}
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">🏷️ Category</p>
                        <p className="text-white font-mono text-sm">{category}</p>
                      </div>
                    </div>

                    {/* Chunk Index */}
                    {chunkIndex !== null && (
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">🔗 Chunk Index</p>
                        <p className="text-white font-mono text-sm">{chunkIndex}</p>
                      </div>
                    )}

                    {/* Metadata Details */}
                    {meta?._original_row_index && (
                      <div className="mt-4 text-xs text-slate-400 border-t border-slate-700 pt-3">
                        <p>Row Index: <span className="text-cyan-400">{meta._original_row_index}</span></p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Start Your Search</h3>
            <p className="text-slate-400">Ask a question about cryptocurrency protocols, blockchain technology, or any crypto-related topic.</p>
          </div>
        )}
      </div>
    </main>
  );
}
