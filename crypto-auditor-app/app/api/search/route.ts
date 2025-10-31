import MindsDB from 'mindsdb-js-sdk';
import { NextResponse } from 'next/server';

const connectToMindsDB = async () => {
  try {
    await MindsDB.connect({
      host: 'http://127.0.0.1:47334', // Use HTTP port for JS SDK
      user: '',
      password: ''
    });
  } catch (error) {
    console.error('Failed to connect to MindsDB:', error);
    return false;
  }
  return true;
};

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return NextResponse.json({ error: 'No question provided' }, { status: 400 });
  }

  if (!(await connectToMindsDB())) {
    return NextResponse.json(
      { error: 'Failed to connect to MindsDB instance' },
      { status: 500 }
    );
  }

  try {
    // CORRECTED QUERY: Use '=' for semantic search
    const query = `
      SELECT
        metadata,
        relevance
      FROM
        web3_kb
      WHERE
        content = '${question}'
      LIMIT 10;
    `;

    console.log('Executing Query:', query);
    const queryResult = await MindsDB.SQL.runQuery(query);

    console.log('Query Result:', JSON.stringify(queryResult, null, 2));
    
    if (queryResult.rows && queryResult.rows.length > 0) {
      // Parse metadata JSON strings and convert relevance to number
      const parsedRows = queryResult.rows.map((row: any) => ({
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        relevance: typeof row.relevance === 'string' ? parseFloat(row.relevance) : row.relevance,
      }));
      
      console.log('First parsed row:', JSON.stringify(parsedRows[0], null, 2));
      return NextResponse.json(parsedRows);
    } else {
      console.log('No rows returned from query');
      return NextResponse.json([]);
    }

  } catch (error: any) {
    console.error('Error during query:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}