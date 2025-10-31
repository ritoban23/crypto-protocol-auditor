# News API Setup for Market Sentiment Tracking

## Getting Your News API Key

1. Go to https://newsapi.org/register
2. Create a free account (provides 100 requests/day)
3. Copy your API key from the dashboard

## Setting Up in MindsDB

Once you have your API key, run this in the MindsDB SQL editor:

```sql
CREATE DATABASE crypto_news
WITH ENGINE = 'newsapi'
PARAMETERS = {
    "api_key": "YOUR_API_KEY_HERE"
};
```

## Testing the Connection

Test with a simple query:

```sql
SELECT title, description, publishedAt, source
FROM crypto_news.article
WHERE query = 'Bitcoin'
LIMIT 5;
```

## Example Queries for Crypto Sentiment

### Get recent Bitcoin news:
```sql
SELECT *
FROM crypto_news.article
WHERE query = 'Bitcoin cryptocurrency'
AND publishedAt >= CURRENT_DATE - INTERVAL 7 DAY
LIMIT 10;
```

### Get news from specific sources:
```sql
SELECT *
FROM crypto_news.article
WHERE query = 'Ethereum'
AND sources = 'coindesk,cointelegraph'
LIMIT 10;
```

### Date range search:
```sql
SELECT *
FROM crypto_news.article
WHERE query = 'Ripple XRP'
AND publishedAt >= '2025-10-01' AND publishedAt <= '2025-10-31'
LIMIT 20;
```

## Rate Limits

- **Free Tier**: 100 requests/day
- **Developer Tier**: 250 requests/day ($449/month)
- **Business Tier**: 1000 requests/day ($1999/month)

## Caching Strategy

To stay within rate limits, we'll implement:
- 1-hour cache for sentiment analysis results
- 30-minute cache for news headlines
- Batch queries for multiple projects in single API call when possible

## Next Steps

1. Get your API key from newsapi.org
2. Run the CREATE DATABASE command in MindsDB
3. Test with a simple query
4. Proceed to sentiment analysis endpoint implementation
