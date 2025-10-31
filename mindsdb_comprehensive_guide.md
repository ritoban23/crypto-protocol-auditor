# MindsDB Complete Reference for RAG Applications with JavaScript

> **Purpose**: This document provides comprehensive context for GitHub Copilot to assist in building MindsDB RAG applications using JavaScript SDK and REST APIs.

## Table of Contents
1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Core Concepts](#core-concepts)
4. [JavaScript SDK](#javascript-sdk)
5. [REST API Reference](#rest-api-reference)
6. [Knowledge Bases (RAG)](#knowledge-bases-rag)
7. [AI Agents](#ai-agents)
8. [Models](#models)
9. [Data Connections](#data-connections)
10. [SQL Commands Reference](#sql-commands-reference)
11. [Best Practices](#best-practices)
12. [Complete RAG Examples](#complete-rag-examples)

---

## Overview

MindsDB is an AI data solution that enables querying data in natural language and SQL across disparate data sources. It acts as a federated query engine with state-of-the-art RAG capabilities.

### Key Features
- **Connect**: Integrates with 200+ data sources (databases, warehouses, SaaS apps, vector databases)
- **Unify**: Knowledge bases, views, and jobs to organize structured and unstructured data
- **Respond**: AI agents, models, and intelligent data retrieval
- **RAG System**: Built-in Retrieval Augmented Generation with automatic chunking, embedding, and reranking

### Architecture
- **Projects**: Containers for organizing models, knowledge bases, and other objects
- **Knowledge Bases**: State-of-the-art RAG implementation with semantic search
- **Agents**: Conversational AI with custom skills (knowledge bases, text-to-SQL)
- **Models**: LLMs, predictive models, and custom ML models
- **Skills**: Reusable tools that agents can use

---

## Installation & Setup

### Docker Desktop (Recommended)
```bash
# Fastest way to get started
docker pull mindsdb/mindsdb
docker run -p 47334:47334 -p 47335:47335 mindsdb/mindsdb
```

### Docker with Custom Configuration
```bash
docker run -d \
  -p 47334:47334 \
  -p 47335:47335 \
  --name mindsdb \
  mindsdb/mindsdb
```

### Connection Details
- **HTTP API**: `http://127.0.0.1:47334`
- **REST API Base**: `http://127.0.0.1:47334/api`
- **MySQL Protocol**: Port `47335`
- **Cloud**: `https://cloud.mindsdb.com`

### MindsDB Cloud
```
Host: cloud.mindsdb.com
User: your_email@domain.com
Password: your_password
API Base: https://cloud.mindsdb.com/api
```

---

## Core Concepts

### Projects
Projects are containers for organizing models, knowledge bases, and other objects. The default project is `mindsdb`.

### Engines
Engines are integrations with AI/ML providers or data sources:
- **ML Engines**: OpenAI, Anthropic, Hugging Face, Langchain
- **Data Engines**: PostgreSQL, MySQL, MongoDB, Vector DBs
- **RAG Engine**: Built-in RAG implementation

### Skills
Skills are reusable tools that agents can use:
- **Knowledge Base Skill**: Semantic search over unstructured data
- **Text-to-SQL Skill**: Convert natural language to SQL queries

---

## JavaScript SDK

### Installation
```bash
npm install mindsdb-js-sdk
# or
yarn add mindsdb-js-sdk
```

### Package Import

**ES6 Modules:**
```javascript
import MindsDB from 'mindsdb-js-sdk';
```

**CommonJS:**
```javascript
const MindsDB = require('mindsdb-js-sdk').default;
```

### TypeScript Support
The SDK has full TypeScript support with exported types:
```typescript
import MindsDB from 'mindsdb-js-sdk';
import { 
  Database, 
  Model, 
  ModelPrediction, 
  Project, 
  Table, 
  View 
} from 'mindsdb-js-sdk';
```

### Connection

#### Connect to MindsDB Cloud
```javascript
import MindsDB from 'mindsdb-js-sdk';

try {
  await MindsDB.connect({
    user: 'your_email@domain.com',
    password: 'your_password'
  });
  console.log('Connected to MindsDB Cloud');
} catch (error) {
  console.error('Failed to authenticate:', error);
}
```

#### Connect to Local Instance
```javascript
try {
  await MindsDB.connect({
    host: 'http://127.0.0.1:47334'
  });
  console.log('Connected to local MindsDB');
} catch (error) {
  console.error('Connection failed:', error);
}
```

#### Custom HTTP Client
```javascript
import MindsDB from 'mindsdb-js-sdk';
import axios from 'axios';

const customAxios = axios.create({
  timeout: 10000,
  headers: { 'Custom-Header': 'value' }
});

try {
  await MindsDB.connect({
    user: 'your_email@domain.com',
    password: 'your_password',
    httpClient: customAxios
  });
} catch (error) {
  console.error('Failed to authenticate:', error);
}
```

### Projects

```javascript
// List all projects
const projects = await MindsDB.Projects.getAllProjects();
projects.forEach(p => {
  console.log(p.name);
});

// Get specific project
const project = await MindsDB.Projects.getProject('my_project');
```

### Databases

#### Create Database Connection
```javascript
// PostgreSQL
const pgParams = {
  user: 'postgres',
  port: 5432,
  password: 'password',
  host: 'localhost',
  database: 'mydb'
};

try {
  const pgDatabase = await MindsDB.Databases.createDatabase(
    'postgres_conn',
    'postgres',
    pgParams
  );
  console.log('PostgreSQL connected');
} catch (error) {
  console.error('Connection failed:', error);
}

// MySQL
const mysqlParams = {
  user: 'root',
  port: 3306,
  password: 'password',
  host: 'localhost',
  database: 'mydb'
};

const mysqlDatabase = await MindsDB.Databases.createDatabase(
  'mysql_conn',
  'mysql',
  mysqlParams
);

// MongoDB
const mongoParams = {
  host: 'localhost',
  port: 27017,
  database: 'mydb',
  username: 'user',
  password: 'pass'
};

const mongoDatabase = await MindsDB.Databases.createDatabase(
  'mongo_conn',
  'mongodb',
  mongoParams
);
```

#### List Databases
```javascript
const databases = await MindsDB.Databases.getAllDatabases();
databases.forEach(db => {
  console.log(db.name, db.engine);
});
```

### Models

#### Create Model
```javascript
// Training options for a model
const trainingOptions = {
  select: 'SELECT * FROM demo_data.home_rentals',
  integration: 'example_db'
};

try {
  // Create and train model
  // Note: Promise resolves when model is CREATED, not when training completes
  let model = await MindsDB.Models.trainModel(
    'home_rentals_model',
    'rental_price',
    'mindsdb',
    trainingOptions
  );
  
  console.log('Model created:', model.name);
  
  // Wait for training to complete (poll status)
  while (model.status !== 'complete') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    model = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');
    console.log('Training status:', model.status);
  }
  
  console.log('Model training complete');
} catch (error) {
  console.error('Model creation failed:', error);
}
```

#### Query Model for Predictions
```javascript
// Get model
const model = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');

// Single prediction
const queryOptions = {
  where: [
    'sqft = 1000',
    'location = "downtown"',
    'days_on_market = 10'
  ]
};

try {
  const prediction = await model.query(queryOptions);
  console.log('Prediction:', prediction);
} catch (error) {
  console.error('Prediction failed:', error);
}

// Batch predictions
const batchQuery = {
  select: 'rental_price',
  from: 'home_rentals_model',
  join: 'demo_data.home_rentals'
};

const batchPredictions = await MindsDB.Models.batchQuery(batchQuery);
```

#### Retrain Model
```javascript
const model = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');

if (model.updateStatus === 'available') {
  try {
    // Simple retrain (uses same training data)
    await model.retrain();
    console.log('Retraining started');
    
    // Custom retrain with new options
    // await model.retrain('example_db', newTrainingOptions);
  } catch (error) {
    console.error('Retrain failed:', error);
  }
}
```

#### Adjust Model
```javascript
const model = await MindsDB.Models.getModel('home_rentals_model', 'mindsdb');

const adjustSelect = 'SELECT * FROM demo_data.home_rentals WHERE days_on_market >= 10';
const params = { learning_rate: 0.001 };

try {
  // Finetune model with new data
  await model.adjust(adjustSelect, params);
  console.log('Model adjustment started');
} catch (error) {
  console.error('Adjustment failed:', error);
}
```

### SQL Queries

#### Execute Raw SQL
```javascript
// Execute any SQL query
const result = await MindsDB.SQL.runQuery(
  'SELECT * FROM my_kb WHERE content LIKE "machine learning" LIMIT 5'
);

console.log(result);

// Alternative method
const queryResult = await MindsDB.setQuery(
  'SELECT * FROM postgres_conn.users LIMIT 10'
);
```

### Jobs (Scheduled Tasks)

```javascript
// Create a job to retrain model daily
const jobQuery = `
  CREATE JOB retrain_model (
    RETRAIN home_rentals_model
  )
  SCHEDULE EVERY 1 day
`;

await MindsDB.SQL.runQuery(jobQuery);
```

### Files

```javascript
// Get uploaded files
const files = await MindsDB.getFiles();
files.forEach(file => {
  console.log(file.name, file.size);
});
```

---

## REST API Reference

### Base URL
- **Local**: `http://127.0.0.1:47334/api`
- **Cloud**: `https://cloud.mindsdb.com/api`

### Authentication

#### Cloud Login
```bash
curl -X POST https://cloud.mindsdb.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@domain.com",
    "password": "password"
  }'
```

Response:
```json
{
  "access_token": "your_jwt_token"
}
```

Use the token in subsequent requests:
```bash
curl -H "Authorization: Bearer your_jwt_token" \
  https://cloud.mindsdb.com/api/projects
```

### SQL Endpoint

#### Execute SQL Query
```bash
curl -X POST http://localhost:47334/api/sql/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM my_kb WHERE content LIKE \"RAG applications\" LIMIT 5"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:47334/api/sql/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'SELECT * FROM my_kb WHERE content LIKE "machine learning" LIMIT 5'
  })
});

const data = await response.json();
console.log(data);
```

### Projects

#### List Projects
```bash
curl http://localhost:47334/api/projects
```

```javascript
const response = await fetch('http://localhost:47334/api/projects');
const projects = await response.json();
```

#### Get Specific Project
```bash
curl http://localhost:47334/api/projects/mindsdb
```

### Databases

#### List Databases
```bash
curl http://localhost:47334/api/databases
```

#### Create Database
```bash
curl -X POST http://localhost:47334/api/databases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "postgres_conn",
    "engine": "postgres",
    "parameters": {
      "host": "localhost",
      "port": "5432",
      "database": "mydb",
      "user": "postgres",
      "password": "password"
    }
  }'
```

**JavaScript Example:**
```javascript
const createDatabase = async () => {
  const response = await fetch('http://localhost:47334/api/databases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'postgres_conn',
      engine: 'postgres',
      parameters: {
        host: 'localhost',
        port: '5432',
        database: 'mydb',
        user: 'postgres',
        password: 'password'
      }
    })
  });
  
  const result = await response.json();
  return result;
};
```

#### Delete Database
```bash
curl -X DELETE http://localhost:47334/api/databases/postgres_conn
```

### Models

#### List Models
```bash
curl http://localhost:47334/api/projects/mindsdb/models
```

#### Create Model
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gpt4_model",
    "predict": "answer",
    "engine": "openai",
    "options": {
      "model_name": "gpt-4o",
      "api_key": "sk-xxx",
      "prompt_template": "Answer this question: {{question}}"
    }
  }'
```

**JavaScript Example:**
```javascript
const createModel = async () => {
  const response = await fetch('http://localhost:47334/api/projects/mindsdb/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'gpt4_model',
      predict: 'answer',
      engine: 'openai',
      options: {
        model_name: 'gpt-4o',
        api_key: process.env.OPENAI_API_KEY,
        prompt_template: 'Answer this question: {{question}}'
      }
    })
  });
  
  return await response.json();
};
```

#### Query Model (Get Predictions)
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/models/gpt4_model/predict \
  -H "Content-Type: application/json" \
  -d '[{"question": "What is machine learning?"}]'
```

**JavaScript Example:**
```javascript
const getPrediction = async (question) => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/models/gpt4_model/predict',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ question }])
    }
  );
  
  const predictions = await response.json();
  return predictions[0];
};

// Usage
const result = await getPrediction('What is RAG?');
console.log(result.answer);
```

#### Describe Model
```bash
curl http://localhost:47334/api/projects/mindsdb/models/gpt4_model?attribute=info
```

Attributes: `info`, `features`, `model`, `ensemble`

#### Delete Model
```bash
curl -X DELETE http://localhost:47334/api/projects/mindsdb/models/gpt4_model
```

### Knowledge Bases

#### List Knowledge Bases
```bash
curl http://localhost:47334/api/projects/mindsdb/knowledge_bases
```

**JavaScript Example:**
```javascript
const listKnowledgeBases = async () => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/knowledge_bases'
  );
  return await response.json();
};
```

#### Get Knowledge Base Details
```bash
curl http://localhost:47334/api/projects/mindsdb/knowledge_bases/my_kb
```

Response:
```json
{
  "id": 2,
  "name": "my_kb",
  "project_id": 1,
  "vector_database": "my_kb_chromadb",
  "vector_database_table": "default_collection",
  "embedding_model": {
    "provider": "openai",
    "model_name": "text-embedding-3-small",
    "api_key": "******"
  },
  "reranking_model": {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "******"
  },
  "metadata_columns": ["category", "date"],
  "content_columns": ["title", "content"],
  "id_column": "doc_id"
}
```

#### Create Knowledge Base
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/knowledge_bases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "docs_kb",
    "embedding_model": {
      "provider": "openai",
      "model_name": "text-embedding-3-large",
      "api_key": "sk-xxx"
    },
    "storage": {
      "provider": "chromadb"
    }
  }'
```

**JavaScript Example:**
```javascript
const createKnowledgeBase = async (name, config) => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/knowledge_bases',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }
  );
  
  return await response.json();
};
```

### Inserting Data into Knowledge Bases

#### From Database Tables

**SQL:**
```sql
INSERT INTO docs_kb
SELECT 
  id,
  title,
  content,
  author,
  created_at
FROM postgres_conn.documents;
```

**JavaScript SDK:**
```javascript
const insertQuery = `
  INSERT INTO docs_kb
  SELECT id, title, content, author, created_at
  FROM postgres_conn.documents
`;

await MindsDB.SQL.runQuery(insertQuery);
```

**REST API:**
```javascript
const insertIntoKB = async () => {
  const query = `
    INSERT INTO docs_kb
    SELECT id, title, content, author, created_at
    FROM postgres_conn.documents
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};
```

#### From Multiple Sources
```sql
INSERT INTO docs_kb
SELECT content FROM postgres_conn.table1
UNION ALL
SELECT content FROM mysql_conn.table2;
```

#### With Chunking Configuration
```sql
INSERT INTO docs_kb
SELECT content FROM data_source.documents
USING
  batch_size = 200,
  threads = 10,
  error = 'skip';  -- Skip errors and continue
```

#### From URLs (Web Scraping)
```sql
CREATE KNOWLEDGE_BASE web_kb
USING
  url = 'https://docs.example.com',
  vector_store_folder_name = 'web_kb_store';
```

### Querying Knowledge Bases

#### Basic Semantic Search

**SQL:**
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'what are the best practices for RAG?'
LIMIT 10;
```

**JavaScript SDK:**
```javascript
const searchQuery = `
  SELECT *
  FROM docs_kb
  WHERE content LIKE 'what are the best practices for RAG?'
  LIMIT 10
`;

const results = await MindsDB.SQL.runQuery(searchQuery);
console.log(results);
```

**REST API:**
```javascript
const semanticSearch = async (kbName, query, limit = 10) => {
  const sqlQuery = `
    SELECT *
    FROM ${kbName}
    WHERE content LIKE '${query}'
    LIMIT ${limit}
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sqlQuery })
  });
  
  return await response.json();
};

// Usage
const results = await semanticSearch('docs_kb', 'RAG best practices', 5);
```

#### With Relevance Threshold
```sql
SELECT 
  content,
  metadata,
  relevance_score
FROM docs_kb
WHERE content LIKE 'machine learning tutorials'
  AND relevance_score > 0.7
LIMIT 5;
```

#### With Metadata Filtering
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'product reviews'
  AND metadata.category = 'electronics'
  AND metadata.date > '2024-01-01'
LIMIT 10;
```

**JavaScript Example:**
```javascript
const searchWithMetadata = async (kbName, searchQuery, filters) => {
  let whereClause = `content LIKE '${searchQuery}'`;
  
  if (filters.category) {
    whereClause += ` AND metadata.category = '${filters.category}'`;
  }
  if (filters.dateFrom) {
    whereClause += ` AND metadata.date > '${filters.dateFrom}'`;
  }
  if (filters.minScore) {
    whereClause += ` AND relevance_score > ${filters.minScore}`;
  }
  
  const query = `
    SELECT content, metadata, relevance_score
    FROM ${kbName}
    WHERE ${whereClause}
    LIMIT ${filters.limit || 10}
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};

// Usage
const results = await searchWithMetadata('docs_kb', 'product reviews', {
  category: 'electronics',
  dateFrom: '2024-01-01',
  minScore: 0.7,
  limit: 10
});
```

---

## AI Agents

### Agent Architecture

Agents in MindsDB are AI-powered assistants that combine Large Language Models with custom skills to interact with your data. They provide intelligent, context-aware responses by orchestrating multiple data sources and tools.

**Core Components:**
- **Model**: Conversational LLM (OpenAI GPT-4, Anthropic Claude, Google Gemini, Llama, etc.)
- **Skills**: Reusable tools the agent can use:
  - **Knowledge Base Skills**: Semantic search over unstructured data (RAG)
  - **Text-to-SQL Skills**: Convert natural language to SQL queries for structured data
- **Prompt Template**: Custom instructions that define agent behavior and personality
- **Data Context**: Direct access to knowledge bases and database tables

**How Agents Work:**
1. User sends a question to the agent
2. Agent analyzes the question using the LLM
3. Agent decides which skills to use based on the question
4. Agent executes skills (searches knowledge bases, queries databases)
5. Agent synthesizes information from multiple sources
6. Agent returns a comprehensive, contextualized answer

**Key Features:**
- **Transparent Reasoning**: See how agents arrive at answers
- **Multi-Source Data**: Combine structured (SQL) and unstructured (documents) data
- **Conversational Memory**: Maintain context across multiple interactions
- **Skill Chaining**: Use multiple skills in sequence to answer complex questions
- **Customizable Behavior**: Control agent personality and response style with prompts

---

### Creating Skills

Skills are the tools that agents use to access data. You must create skills before assigning them to agents.

#### Knowledge Base Skill

Knowledge Base skills enable agents to perform semantic search over unstructured data using RAG.

**SQL:**
```sql
CREATE SKILL kb_skill
USING
  type = 'knowledge_base',
  source = 'docs_kb',  -- name of your knowledge base
  description = 'Product documentation, user guides, and technical manuals from 2020-2024';
```

**Best Practices for KB Skill Descriptions:**
- Be specific about the content type (docs, articles, manuals)
- Include time periods if relevant
- Mention key topics or categories
- Help the agent understand when to use this skill

**JavaScript SDK:**
```javascript
const createKBSkill = async () => {
  const query = `
    CREATE SKILL kb_skill
    USING
      type = 'knowledge_base',
      source = 'docs_kb',
      description = 'Product documentation and user guides'
  `;
  
  await MindsDB.SQL.runQuery(query);
};
```

**REST API:**
```javascript
const createKBSkill = async (skillName, kbName, description) => {
  const query = `
    CREATE SKILL ${skillName}
    USING
      type = 'knowledge_base',
      source = '${kbName}',
      description = '${description}'
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};

// Usage
await createKBSkill(
  'docs_skill',
  'docs_kb',
  'Technical documentation for API v2, including authentication, endpoints, and examples'
);
```

#### Text-to-SQL Skill

Text-to-SQL skills convert natural language questions into SQL queries to retrieve data from databases.

**SQL:**
```sql
CREATE SKILL text2sql_skill
USING
  type = 'text2sql',
  database = 'postgres_conn',  -- database connection name
  tables = ['customers', 'orders', 'products'],  -- specific tables to access
  description = 'Customer and order data from 2020-2024, including purchase history and product catalog';
```

**Important Parameters:**
- `database`: Must be a connected database (created with CREATE DATABASE)
- `tables`: List specific tables to limit scope and improve performance
- `description`: Describe the data, time periods, and what questions it can answer

**Best Practices for Text-to-SQL:**
- Only include necessary tables (reduces token usage and improves accuracy)
- Provide clear descriptions of what data exists
- Mention important columns or relationships
- Specify time ranges if data is time-bound

**JavaScript SDK:**
```javascript
const createText2SQLSkill = async (skillName, database, tables, description) => {
  const tablesStr = tables.map(t => `'${t}'`).join(', ');
  
  const query = `
    CREATE SKILL ${skillName}
    USING
      type = 'text2sql',
      database = '${database}',
      tables = [${tablesStr}],
      description = '${description}'
  `;
  
  await MindsDB.SQL.runQuery(query);
};

// Usage
await createText2SQLSkill(
  'sales_skill',
  'postgres_conn',
  ['customers', 'orders', 'products', 'sales_reps'],
  'Sales data from 2020-2024 including customer info, order history, product catalog, and sales rep performance'
);
```

**REST API:**
```javascript
const createText2SQLSkill = async (config) => {
  const tablesStr = config.tables.map(t => `'${t}'`).join(', ');
  
  const query = `
    CREATE SKILL ${config.name}
    USING
      type = 'text2sql',
      database = '${config.database}',
      tables = [${tablesStr}],
      description = '${config.description}'
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};

// Usage
await createText2SQLSkill({
  name: 'analytics_skill',
  database: 'analytics_db',
  tables: ['sessions', 'events', 'users'],
  description: 'User analytics data: sessions, events, and user profiles from Jan 2023 onwards'
});
```

#### Managing Skills

**List All Skills:**
```sql
SHOW SKILLS;
```

**Get Skill Details:**
```sql
DESCRIBE SKILL kb_skill;
```

**Delete a Skill:**
```sql
DROP SKILL kb_skill;
```

**JavaScript:**
```javascript
// List skills
const skills = await MindsDB.SQL.runQuery('SHOW SKILLS');

// Drop skill
await MindsDB.SQL.runQuery('DROP SKILL old_skill');
```

---

### Creating Agents

#### Method 1: Using Pre-created Model

Create a conversational model first, then create an agent that uses it.

**Step 1: Create Conversational Model**
```sql
CREATE MODEL conversational_model
PREDICT answer
USING
  engine = 'langchain',
  openai_api_key = 'sk-xxx',
  model_name = 'gpt-4o',
  mode = 'conversational',
  user_column = 'question',
  assistant_column = 'answer',
  max_tokens = 1000,
  temperature = 0.7,
  verbose = true,
  prompt_template = 'You are a helpful assistant. Answer questions accurately and concisely.';
```

**Step 2: Create Agent with Model**
```sql
CREATE AGENT support_agent
USING
  model = 'conversational_model',  -- reference to created model
  skills = ['kb_skill', 'text2sql_skill'];
```

#### Method 2: Inline Model Definition (Recommended)

Define the model directly when creating the agent. This is simpler and more maintainable.

**SQL:**
```sql
CREATE AGENT support_agent
USING
  model = {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "sk-xxx"
  },
  skills = ['kb_skill', 'text2sql_skill'];
```

**Supported Providers:**
- `openai`: GPT-4o, GPT-4, GPT-3.5-turbo
- `anthropic`: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet
- `anyscale`: Llama 3, Mixtral, and other open-source models
- `ollama`: Local models
- `litellm`: Unified interface for 100+ LLM providers
- `mindsdb`: Models created within MindsDB

**JavaScript SDK:**
```javascript
const createBasicAgent = async () => {
  const query = `
    CREATE AGENT support_agent
    USING
      model = {
        "provider": "openai",
        "model_name": "gpt-4o",
        "api_key": "${process.env.OPENAI_API_KEY}"
      },
      skills = ['kb_skill', 'text2sql_skill']
  `;
  
  await MindsDB.SQL.runQuery(query);
};
```

**REST API:**
```javascript
const createAgent = async (name, model, skills) => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/agents',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        model,
        skills
      })
    }
  );
  
  return await response.json();
};

// Usage
await createAgent('support_agent', {
  provider: 'openai',
  model_name: 'gpt-4o',
  api_key: process.env.OPENAI_API_KEY
}, ['kb_skill', 'text2sql_skill']);
```

#### Method 3: Agent with Data Context (Simplified)

Create an agent with direct data access without explicitly creating skills.

**SQL:**
```sql
CREATE AGENT sales_agent
USING
  model = {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "sk-xxx"
  },
  data = {
    "knowledge_bases": ["sales_kb", "product_kb"],
    "tables": ["postgres_conn.customers", "postgres_conn.orders"]
  },
  prompt_template = '
    You have access to:
    - sales_kb: Sales training materials and best practices
    - product_kb: Product specifications and pricing
    - customers table: Customer information and contact details
    - orders table: Order history and transaction data
    
    When answering:
    1. Search knowledge bases for conceptual information
    2. Query tables for specific data points
    3. Combine information from multiple sources
    4. Cite your sources
  ';
```

**This method automatically creates skills behind the scenes.**

#### Advanced Agent with Custom Prompt

**SQL:**
```sql
CREATE AGENT sales_agent
USING
  model = {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "sk-xxx"
  },
  skills = ['sales_kb_skill', 'crm_skill', 'analytics_skill'],
  prompt_template = '
    # Role
    You are an expert sales assistant for Acme Corp.
    
    # Available Tools
    - sales_kb_skill: Sales methodology, pitch decks, case studies
    - crm_skill: Customer data, interaction history, deals
    - analytics_skill: Sales metrics, forecasts, performance data
    
    # Guidelines
    1. Always ground answers in actual data from skills
    2. When discussing customers, check CRM first
    3. Provide specific numbers and metrics when available
    4. If data is missing, state this clearly
    5. Be professional but conversational
    6. Suggest next steps or actions when appropriate
    
    # Response Format
    - Start with a direct answer
    - Provide supporting data
    - End with recommendations or next steps
    
    # Tone
    Professional, data-driven, action-oriented
  ',
  max_tokens = 2000,
  temperature = 0.3,  -- Lower for more consistent, factual responses
  verbose = true;  -- Show reasoning steps
```

**JavaScript with Full Configuration:**
```javascript
const createAdvancedAgent = async (config) => {
  const modelStr = JSON.stringify(config.model).replace(/"/g, '\\"');
  const skillsStr = config.skills.map(s => `'${s}'`).join(', ');
  
  const query = `
    CREATE AGENT ${config.name}
    USING
      model = "${modelStr}",
      skills = [${skillsStr}],
      prompt_template = '${config.prompt_template.replace(/'/g, "''")}',
      max_tokens = ${config.max_tokens || 1000},
      temperature = ${config.temperature || 0.7},
      verbose = ${config.verbose || false}
  `;
  
  await MindsDB.SQL.runQuery(query);
};

// Usage
await createAdvancedAgent({
  name: 'customer_success_agent',
  model: {
    provider: 'anthropic',
    model_name: 'claude-3-5-sonnet-20241022',
    api_key: process.env.ANTHROPIC_API_KEY
  },
  skills: ['kb_skill', 'support_tickets_skill', 'product_usage_skill'],
  prompt_template: `
    You are a customer success manager.
    Use kb_skill for documentation, support_tickets_skill for history,
    and product_usage_skill for usage analytics.
    Be empathetic, solution-focused, and proactive.
  `,
  max_tokens: 2000,
  temperature: 0.5,
  verbose: true
});
```

#### Agent Model Parameters

**Common Parameters:**
- `model_name`: The specific model to use
- `api_key`: Authentication key for the provider
- `max_tokens`: Maximum length of response (default: 1000)
- `temperature`: Randomness (0-2, lower = more deterministic)
- `top_p`: Nucleus sampling (0-1, alternative to temperature)
- `verbose`: Show reasoning and skill execution steps
- `prompt_template`: System instructions for the agent

**Example with All Parameters:**
```sql
CREATE AGENT precise_agent
USING
  provider = 'openai',
  model = 'gpt-4o',
  prompt_template = 'You are a precise, fact-focused assistant.',
  max_tokens = 1500,
  temperature = 0.2,
  top_p = 0.9,
  presence_penalty = 0.0,
  frequency_penalty = 0.0,
  verbose = true,
  skills = ['kb_skill'];
```

---

### Querying Agents

Once an agent is created, you can interact with it by asking questions. The agent will use its skills to find relevant information and provide comprehensive answers.

#### Single Question

**SQL:**
```sql
SELECT *
FROM support_agent
WHERE question = 'How do I reset my password?';

-- More specific query
SELECT answer, context
FROM support_agent
WHERE question = 'What were our top 5 selling products last quarter?';
```

**JavaScript SDK:**
```javascript
const askAgent = async (agentName, question) => {
  const query = `
    SELECT answer
    FROM ${agentName}
    WHERE question = '${question.replace(/'/g, "''")}'
  `;
  
  const result = await MindsDB.SQL.runQuery(query);
  return result[0]?.answer;
};

// Usage
const answer = await askAgent(
  'support_agent',
  'How do I configure OAuth authentication?'
);
console.log(answer);
```

**REST API (Non-Streaming):**
```javascript
const queryAgent = async (agentName, question) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ question, answer: null }]
      })
    }
  );
  
  const result = await response.json();
  return result.answer || result.messages[0].answer;
};

// Usage
const answer = await queryAgent(
  'support_agent',
  'What is the return policy?'
);
console.log(answer);
```

#### Multiple Questions in Batch

**SQL:**
```sql
SELECT question, answer
FROM support_agent
WHERE question IN (
  'What is our return policy?',
  'How long does shipping take?',
  'Do you offer international shipping?'
);
```

**JavaScript:**
```javascript
const batchQuery = async (agentName, questions) => {
  const results = [];
  
  for (const question of questions) {
    const answer = await queryAgent(agentName, question);
    results.push({ question, answer });
  }
  
  return results;
};

// Usage
const questions = [
  'What payment methods do you accept?',
  'How do I track my order?',
  'Can I cancel my order?'
];

const answers = await batchQuery('support_agent', questions);
answers.forEach(({ question, answer }) => {
  console.log(`Q: ${question}\nA: ${answer}\n`);
});
```

#### Streaming Responses (Real-time)

For better user experience, stream agent responses as they're generated.

**REST API with Server-Sent Events:**
```javascript
const queryAgentStream = async (agentName, question, onChunk, onComplete) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ question, answer: '' }]
      })
    }
  );
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'chunk') {
            fullAnswer += data.content;
            onChunk(data.content);
          } else if (data.type === 'answer') {
            onComplete(data.content || fullAnswer);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
};

// Usage
await queryAgentStream(
  'support_agent',
  'Explain how to set up a custom domain',
  (chunk) => {
    process.stdout.write(chunk); // Print as it arrives
  },
  (fullAnswer) => {
    console.log('\n\nComplete answer:', fullAnswer);
  }
);
```

**React Component with Streaming:**
```javascript
import { useState } from 'react';

function AgentChat({ agentName }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  
  const askQuestion = async () => {
    setLoading(true);
    setAnswer('');
    
    const response = await fetch(
      `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions/stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ question, answer: '' }]
        })
      }
    );
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              setAnswer(prev => prev + data.content);
            }
          } catch (e) {}
        }
      }
    }
    
    setLoading(false);
  };
  
  return (
    <div>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      <div>{answer}</div>
    </div>
  );
}
```

#### Conversational Context

Agents maintain context across a conversation by passing message history.

**REST API with Context:**
```javascript
const conversation = async (agentName, messages) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    }
  );
  
  return await response.json();
};

// Usage - Multi-turn conversation
let conversationHistory = [];

// Turn 1
conversationHistory.push({
  question: 'What products do we sell?',
  answer: null
});

let result = await conversation('support_agent', conversationHistory);
conversationHistory[conversationHistory.length - 1].answer = result.answer;

// Turn 2 - Agent remembers previous context
conversationHistory.push({
  question: 'Which one is the most popular?',
  answer: null
});

result = await conversation('support_agent', conversationHistory);
console.log(result.answer); // Agent knows "one" refers to products from previous question
```

---

### Managing Agents

#### List All Agents

**SQL:**
```sql
SHOW AGENTS;
```

**REST API:**
```javascript
const listAgents = async () => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/agents'
  );
  return await response.json();
};
```

#### Get Agent Details

**SQL:**
```sql
DESCRIBE AGENT support_agent;
```

**REST API:**
```javascript
const getAgent = async (agentName) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}`
  );
  return await response.json();
};

// Usage
const agent = await getAgent('support_agent');
console.log('Model:', agent.model);
console.log('Skills:', agent.skills);
```

#### Update Agent

**Add/Remove Skills:**
```sql
UPDATE AGENT support_agent
SET
  skills_to_add = ['new_skill'],
  skills_to_remove = ['old_skill'];
```

**Change Model:**
```sql
UPDATE AGENT support_agent
SET
  model = {
    "provider": "anthropic",
    "model_name": "claude-3-5-sonnet-20241022",
    "api_key": "sk-ant-xxx"
  };
```

**Update Prompt Template:**
```sql
UPDATE AGENT support_agent
SET
  prompt_template = 'New instructions for the agent...';
```

**REST API:**
```javascript
const updateAgent = async (agentName, updates) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }
  );
  
  return await response.json();
};

// Usage - Add new skill
await updateAgent('support_agent', {
  skills: ['kb_skill', 'text2sql_skill', 'new_skill']
});

// Usage - Change model
await updateAgent('support_agent', {
  model: {
    provider: 'anthropic',
    model_name: 'claude-3-5-sonnet-20241022',
    api_key: process.env.ANTHROPIC_API_KEY
  }
});
```

#### Delete Agent

**SQL:**
```sql
DROP AGENT support_agent;
```

**REST API:**
```javascript
const deleteAgent = async (agentName) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}`,
    { method: 'DELETE' }
  );
  
  return await response.json();
};
```

---

### Agent Best Practices

#### 1. Write Effective Prompt Templates

**Bad Prompt:**
```
You are a helpful assistant.
```

**Good Prompt:**
```
# Role
You are a technical support specialist for Acme SaaS Platform.

# Available Tools
- docs_kb: Product documentation, API guides, troubleshooting
- support_history: Past tickets and resolutions
- user_data: Account information and usage statistics

# Guidelines
1. Always search docs_kb first for official guidance
2. Check support_history for similar issues and solutions
3. Verify user information before providing account-specific help
4. Provide step-by-step instructions
5. Include relevant links to documentation
6. If unsure, escalate to human support

# Response Style
- Be friendly but professional
- Use clear, simple language
- Break complex topics into steps
- Always verify you've fully answered the question
```

#### 2. Design Skills Strategically

**Knowledge Base Skills:**
- Create separate KBs for different content types (docs, FAQs, policies)
- Keep descriptions specific and detailed
- Include time ranges when relevant
- Update KB content regularly

**Text-to-SQL Skills:**
- Only include necessary tables
- Describe column meanings clearly
- Mention important relationships
- Specify data freshness

**Example:**
```sql
-- Good: Specific, scoped skill
CREATE SKILL recent_sales_skill
USING
  type = 'text2sql',
  database = 'sales_db',
  tables = ['orders', 'customers'],
  description = 'Order data from 2024 including customer names, order amounts, dates, and status. Updated real-time.';

-- Bad: Vague, too broad
CREATE SKILL data_skill
USING
  type = 'text2sql',
  database = 'sales_db',
  tables = ['orders', 'customers', 'products', 'inventory', 'shipping'],
  description = 'Some data';
```

#### 3. Handle Agent Limitations

Agents may not always have the right information. Build in graceful handling:

```sql
CREATE AGENT support_agent
USING
  model = {...},
  skills = ['kb_skill', 'ticket_skill'],
  prompt_template = '
    When you cannot find information in available tools:
    1. State clearly what information is missing
    2. Explain what you searched
    3. Suggest alternative approaches
    4. Offer to escalate if needed
    
    Never make up information. Always be honest about limitations.
  ';
```

#### 4. Monitor and Improve

**Track Agent Performance:**
- Log all questions and answers
- Review incorrect or unhelpful responses
- Identify knowledge gaps
- Update skills and prompts based on usage

**Example Logging:**
```javascript
const queryWithLogging = async (agentName, question) => {
  const startTime = Date.now();
  
  try {
    const answer = await queryAgent(agentName, question);
    const duration = Date.now() - startTime;
    
    // Log to your analytics system
    await logAgentQuery({
      agent: agentName,
      question,
      answer,
      duration,
      timestamp: new Date(),
      success: true
    });
    
    return answer;
  } catch (error) {
    // Log failures
    await logAgentQuery({
      agent: agentName,
      question,
      error: error.message,
      timestamp: new Date(),
      success: false
    });
    
    throw error;
  }
};
```

#### 5. Optimize for Performance

**Reduce Latency:**
- Use faster models for simple questions (GPT-3.5 vs GPT-4)
- Limit knowledge base size to relevant content
- Use specific table lists in text-to-SQL skills
- Implement caching for common questions

**Example with Model Selection:**
```javascript
const queryWithModelSelection = async (question) => {
  // Simple questions use faster model
  if (isSimpleQuestion(question)) {
    return await queryAgent('fast_agent', question);
  }
  
  // Complex questions use powerful model
  return await queryAgent('advanced_agent', question);
};

function isSimpleQuestion(question) {
  const simplePatterns = [
    /^what is/i,
    /^define/i,
    /^explain/i
  ];
  
  return simplePatterns.some(pattern => pattern.test(question));
}
```

#### 6. Security and Access Control

**Implement User-Based Filtering:**
```javascript
const queryAgentSecure = async (agentName, question, userId) => {
  // Add user context to question
  const contextualQuestion = `[User ID: ${userId}] ${question}`;
  
  // Agent should have skill that filters by user
  return await queryAgent(agentName, contextualQuestion);
};
```

**Create User-Scoped Skills:**
```sql
CREATE SKILL user_data_skill
USING
  type = 'text2sql',
  database = 'app_db',
  tables = ['user_data', 'user_settings'],
  description = 'User-specific data. Always filter by user_id from the question context.';
```

---

### Hybrid Search in Knowledge Bases

Hybrid search combines semantic similarity search (embeddings) with keyword-based search (BM25) to provide more accurate and comprehensive results.

**Why Hybrid Search?**
- **Semantic Search**: Great for concepts, ideas, natural language
- **Keyword Search**: Essential for acronyms, IDs, specific terminology
- **Hybrid**: Best of both worlds - finds both conceptually similar and exactly matching content

**How It Works:**
1. Query is processed in parallel by both search methods
2. Semantic search finds conceptually similar documents using embeddings
3. Keyword search finds exact matches using full-text index (BM25)
4. Results are combined and reranked for relevance
5. Top results are returned to the agent or user

#### Enabling Hybrid Search

Hybrid search is enabled at query time using specific parameters.

**Basic Hybrid Search:**
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'API authentication'
USING
  hybrid_search = true
LIMIT 10;
```

**JavaScript SDK:**
```javascript
const hybridSearch = async (kbName, query, limit = 10) => {
  const sqlQuery = `
    SELECT content, metadata, relevance_score
    FROM ${kbName}
    WHERE content LIKE '${query}'
    USING hybrid_search = true
    LIMIT ${limit}
  `;
  
  const results = await MindsDB.SQL.runQuery(sqlQuery);
  return results;
};

// Usage
const results = await hybridSearch('docs_kb', 'OAuth2 setup', 5);
```

**REST API:**
```javascript
const hybridSearch = async (kbName, query, limit = 10) => {
  const sqlQuery = `
    SELECT content, metadata, relevance_score
    FROM ${kbName}
    WHERE content LIKE '${query}'
    USING hybrid_search = true
    LIMIT ${limit}
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sqlQuery })
  });
  
  return await response.json();
};
```

#### Controlling Search Balance (Alpha Parameter)

The `hybrid_search_alpha` parameter controls the balance between semantic and keyword relevance:
- **0**: Pure keyword search (BM25 only)
- **0.5**: Balanced (default)
- **1**: Pure semantic search (embeddings only)

**Favor Keyword Matching:**
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'API-KEY-12345'  -- Looking for specific ID
USING
  hybrid_search = true,
  hybrid_search_alpha = 0.2  -- Emphasize keyword matching
LIMIT 10;
```

**Favor Semantic Matching:**
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'how to improve application performance'  -- Conceptual query
USING
  hybrid_search = true,
  hybrid_search_alpha = 0.8  -- Emphasize semantic similarity
LIMIT 10;
```

**JavaScript Example:**
```javascript
const adaptiveHybridSearch = async (kbName, query, limit = 10) => {
  // Detect if query contains specific identifiers
  const hasSpecificTerms = /[A-Z0-9]{5,}|\d{3,}/.test(query);
  
  // Adjust alpha based on query type
  const alpha = hasSpecificTerms ? 0.3 : 0.7;
  
  const sqlQuery = `
    SELECT content, metadata, relevance_score
    FROM ${kbName}
    WHERE content LIKE '${query}'
    USING
      hybrid_search = true,
      hybrid_search_alpha = ${alpha}
    LIMIT ${limit}
  `;
  
  return await MindsDB.SQL.runQuery(sqlQuery);
};

// Usage
const results1 = await adaptiveHybridSearch('docs_kb', 'ORDER-2024-5678'); // Uses alpha=0.3
const results2 = await adaptiveHybridSearch('docs_kb', 'shipping policy'); // Uses alpha=0.7
```

#### Reranking in Hybrid Search

Hybrid search uses two reranking strategies:

**1. Using Knowledge Base Reranking Model**

If the KB was created with a reranking model, hybrid search uses it automatically:

```sql
-- KB created with reranking
CREATE KNOWLEDGE_BASE docs_kb
USING
  embedding_model = {...},
  reranking_model = {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "sk-xxx"
  };

-- Hybrid search uses the reranking model
SELECT *
FROM docs_kb
WHERE content LIKE 'authentication methods'
USING hybrid_search = true
LIMIT 10;
```

**2. Using Alpha-Based Reranking**

When no reranking model exists, or when you want custom control:

```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'authentication methods'
USING
  hybrid_search = true,
  hybrid_search_alpha = 0.6
LIMIT 10;
```

**Disabling Reranking:**
```sql
SELECT *
FROM docs_kb
WHERE content LIKE 'search query'
USING
  hybrid_search = true,
  reranking = false  -- Skip reranking for performance
LIMIT 10;
```

#### When to Use Hybrid Search

**Use Hybrid Search When:**
- Searching for technical terms, acronyms, or identifiers
- Users might use both natural language and specific keywords
- Dealing with domain-specific terminology
- Need high precision and recall
- Content includes product codes, ticket IDs, etc.

**Use Semantic-Only Search When:**
- All queries are conceptual/natural language
- No specific terminology or IDs
- Focused on understanding intent
- Performance is critical

**Example Decision Logic:**
```javascript
const intelligentSearch = async (kbName, query) => {
  // Patterns that benefit from hybrid search
  const hybridPatterns = [
    /\b[A-Z0-9]{3,}\b/,  // Acronyms
    /\d{3,}/,            // Numbers/IDs
    /-\d+/,              // Ticket numbers
    /\b[A-Z]{2,}-[A-Z0-9]+\b/  // Product codes
  ];
  
  const useHybrid = hybridPatterns.some(pattern => pattern.test(query));
  
  if (useHybrid) {
    return await hybridSearch(kbName, query);
  } else {
    return await semanticSearch(kbName, query);
  }
};
```

#### Full-Text Index Storage

Hybrid search requires a full-text index. MindsDB automatically maintains this index alongside embeddings in your vector store (ChromaDB or PGVector).

**No additional configuration needed** - the index is built automatically when you insert data into a knowledge base.

#### BM25 Scoring

BM25 (Best Matching 25) is used for keyword relevance scoring. It considers:
- Term frequency in document
- Document length normalization
- Term rarity across all documents

**Higher BM25 score = More relevant for keyword search**

#### Complete Hybrid Search Example

```javascript
// Comprehensive hybrid search implementation

const performHybridSearch = async (config) => {
  const {
    kbName,
    query,
    alpha = 0.5,
    minScore = 0.0,
    metadataFilters = {},
    limit = 10,
    useReranking = true
  } = config;
  
  // Build WHERE clause
  let whereClause = `content LIKE '${query.replace(/'/g, "''")}'`;
  
  if (minScore > 0) {
    whereClause += ` AND relevance_score > ${minScore}`;
  }
  
  // Add metadata filters
  Object.entries(metadataFilters).forEach(([key, value]) => {
    whereClause += ` AND metadata.${key} = '${value}'`;
  });
  
  // Build USING clause
  let usingClause = `hybrid_search = true, hybrid_search_alpha = ${alpha}`;
  if (!useReranking) {
    usingClause += ', reranking = false';
  }
  
  const sqlQuery = `
    SELECT 
      content,
      metadata,
      relevance_score
    FROM ${kbName}
    WHERE ${whereClause}
    USING ${usingClause}
    LIMIT ${limit}
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sqlQuery })
  });
  
  return await response.json();
};

// Usage examples
// 1. Balanced hybrid search
const results1 = await performHybridSearch({
  kbName: 'docs_kb',
  query: 'API authentication OAuth2',
  alpha: 0.5,
  limit: 10
});

// 2. Keyword-focused search for IDs
const results2 = await performHybridSearch({
  kbName: 'docs_kb',
  query: 'TICKET-2024-5678',
  alpha: 0.2,  // Favor keyword matching
  limit: 5
});

// 3. Semantic search with metadata filters
const results3 = await performHybridSearch({
  kbName: 'docs_kb',
  query: 'how to deploy applications',
  alpha: 0.8,  // Favor semantic
  metadataFilters: {
    category: 'deployment',
    version: 'v2'
  },
  minScore: 0.7,
  limit: 10
});
```

---

## Models

### Creating Models

#### Large Language Model

**SQL:**
```sql
CREATE MODEL gpt4_model
PREDICT answer
USING
  engine = 'openai',
  model_name = 'gpt-4o',
  api_key = 'sk-xxx',
  prompt_template = 'Answer this question: {{question}}';
```

**JavaScript SDK:**
```javascript
const model = await MindsDB.Models.trainModel(
  'gpt4_model',
  'answer',
  'mindsdb',
  {
    engine: 'openai',
    model_name: 'gpt-4o',
    api_key: process.env.OPENAI_API_KEY,
    prompt_template: 'Answer this question: {{question}}'
  }
);
```

**REST API:**
```javascript
const createLLM = async (name, config) => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/models',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        predict: 'answer',
        engine: config.engine,
        options: {
          model_name: config.model_name,
          api_key: config.api_key,
          prompt_template: config.prompt_template
        }
      })
    }
  );
  
  return await response.json();
};

// Usage
await createLLM('gpt4_model', {
  engine: 'openai',
  model_name: 'gpt-4o',
  api_key: process.env.OPENAI_API_KEY,
  prompt_template: 'Answer this question: {{question}}'
});
```

#### RAG Model

**SQL:**
```sql
CREATE MODEL rag_model
PREDICT answer
USING
  engine = 'langchain',
  llm_type = 'openai',
  url = 'https://docs.example.com',
  vector_store_folder_name = 'doc_vectors',
  input_column = 'question';
```

**JavaScript Example:**
```javascript
const createRAGModel = async () => {
  const query = `
    CREATE MODEL rag_model
    PREDICT answer
    USING
      engine = 'langchain',
      llm_type = 'openai',
      url = 'https://docs.example.com',
      vector_store_folder_name = 'doc_vectors',
      input_column = 'question'
  `;
  
  await MindsDB.SQL.runQuery(query);
};
```

### Using Models

#### Single Prediction

**SQL:**
```sql
SELECT answer
FROM gpt4_model
WHERE question = 'What is machine learning?';
```

**JavaScript SDK:**
```javascript
const model = await MindsDB.Models.getModel('gpt4_model', 'mindsdb');

const prediction = await model.query({
  where: ["question = 'What is machine learning?'"]
});

console.log(prediction);
```

**REST API:**
```javascript
const getPrediction = async (modelName, input) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/models/${modelName}/predict`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([input])
    }
  );
  
  const predictions = await response.json();
  return predictions[0];
};

// Usage
const result = await getPrediction('gpt4_model', {
  question: 'What is machine learning?'
});
console.log(result.answer);
```

#### Batch Predictions

**SQL:**
```sql
SELECT 
  t.question,
  m.answer
FROM questions_table AS t
JOIN gpt4_model AS m
LIMIT 100;
```

**JavaScript SDK:**
```javascript
const batchQuery = {
  select: 'answer',
  from: 'gpt4_model',
  join: 'postgres_conn.questions'
};

const results = await MindsDB.Models.batchQuery(batchQuery);
```

---

## Data Connections

### Connecting Databases

#### PostgreSQL

**SQL:**
```sql
CREATE DATABASE postgres_conn
WITH ENGINE = 'postgres',
PARAMETERS = {
  "host": "localhost",
  "port": "5432",
  "database": "mydb",
  "user": "username",
  "password": "password",
  "schema": "public"
};
```

**JavaScript SDK:**
```javascript
const pgParams = {
  user: 'postgres',
  port: 5432,
  password: 'password',
  host: 'localhost',
  database: 'mydb',
  schema: 'public'
};

const pgDatabase = await MindsDB.Databases.createDatabase(
  'postgres_conn',
  'postgres',
  pgParams
);
```

**REST API:**
```javascript
const connectPostgres = async (name, params) => {
  const response = await fetch('http://localhost:47334/api/databases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      engine: 'postgres',
      parameters: params
    })
  });
  
  return await response.json();
};

// Usage
await connectPostgres('postgres_conn', {
  host: 'localhost',
  port: '5432',
  database: 'mydb',
  user: 'postgres',
  password: 'password',
  schema: 'public'
});
```

#### MySQL

**SQL:**
```sql
CREATE DATABASE mysql_conn
WITH ENGINE = 'mysql',
PARAMETERS = {
  "host": "localhost",
  "port": "3306",
  "database": "mydb",
  "user": "username",
  "password": "password"
};
```

**JavaScript SDK:**
```javascript
const mysqlParams = {
  user: 'root',
  port: 3306,
  password: 'password',
  host: 'localhost',
  database: 'mydb'
};

const mysqlDatabase = await MindsDB.Databases.createDatabase(
  'mysql_conn',
  'mysql',
  mysqlParams
);
```

#### MongoDB

**SQL:**
```sql
CREATE DATABASE mongo_conn
WITH ENGINE = 'mongodb',
PARAMETERS = {
  "host": "localhost",
  "port": "27017",
  "database": "mydb",
  "username": "user",
  "password": "pass"
};
```

**JavaScript SDK:**
```javascript
const mongoParams = {
  host: 'localhost',
  port: 27017,
  database: 'mydb',
  username: 'user',
  password: 'pass'
};

const mongoDatabase = await MindsDB.Databases.createDatabase(
  'mongo_conn',
  'mongodb',
  mongoParams
);
```

### Querying Connected Data

**SQL:**
```sql
-- Query data from connected source
SELECT * FROM postgres_conn.public.users LIMIT 10;

-- Join across data sources
SELECT 
  p.product_name,
  m.sales_count
FROM postgres_conn.products AS p
JOIN mongo_conn.analytics AS m
  ON p.id = m.product_id;
```

**JavaScript SDK:**
```javascript
const queryDatabase = async (dbName, table, limit = 10) => {
  const query = `SELECT * FROM ${dbName}.${table} LIMIT ${limit}`;
  const result = await MindsDB.SQL.runQuery(query);
  return result;
};

// Usage
const users = await queryDatabase('postgres_conn', 'public.users', 10);
```

---

## SQL Commands Reference

### Knowledge Bases
```sql
-- Create
CREATE KNOWLEDGE_BASE kb_name USING ...;

-- Insert
INSERT INTO kb_name SELECT ...;

-- Query
SELECT * FROM kb_name WHERE content LIKE '...' LIMIT 10;

-- Drop
DROP KNOWLEDGE_BASE kb_name;
```

### Agents
```sql
-- Create
CREATE AGENT agent_name USING model = {...}, skills = [...];

-- Query
SELECT * FROM agent_name WHERE question = '...';

-- Update
UPDATE AGENT agent_name SET skills_to_add = ['new_skill'];

-- Drop
DROP AGENT agent_name;
```

### Models
```sql
-- Create
CREATE MODEL model_name PREDICT target USING engine = '...';

-- Query
SELECT * FROM model_name WHERE input_col = '...';

-- Retrain
RETRAIN model_name;

-- Finetune
FINETUNE model_name FROM data_source (...);

-- Drop
DROP MODEL model_name;
```

### Skills
```sql
-- Create
CREATE SKILL skill_name USING type = '...', source = '...';

-- Drop
DROP SKILL skill_name;
```

### Databases
```sql
-- Create
CREATE DATABASE db_name WITH ENGINE = '...', PARAMETERS = {...};

-- Query
SELECT * FROM db_name.table_name;

-- Drop
DROP DATABASE db_name;
```

---

## Best Practices

### Knowledge Bases

1. **Choose the Right Embedding Model**
   - `text-embedding-3-small`: Fast, cost-effective (1536 dimensions)
   - `text-embedding-3-large`: Better quality, higher cost (3072 dimensions)
   - Hugging Face models: Open source, customizable

2. **Optimize Chunking**
   - Default chunk size works for most documents
   - Consider document structure (sections, paragraphs)
   - Test with your specific content type

3. **Use Metadata Effectively**
   - Add relevant metadata columns (date, author, category, source)
   - Filter by metadata to improve search relevance
   - Combine semantic search with metadata filters

4. **Enable Reranking for Better Results**
   - Reranking improves result quality significantly
   - Use GPT-4o for best reranking performance
   - Balance between speed and accuracy

5. **Partition Large Datasets**
   - Use partitioning for multi-tenant scenarios
   - Improve performance with parallel processing
   - Set appropriate batch_size and threads

### Agents

1. **Write Clear Prompts**
   - Describe data sources and their contents clearly
   - Specify expected behavior and output format
   - Include examples when helpful
   - Set boundaries and limitations

2. **Use Appropriate Skills**
   - Knowledge bases for unstructured data (docs, articles)
   - Text-to-SQL for structured data (databases)
   - Combine both for comprehensive answers
   - Keep skill descriptions detailed

3. **Test Thoroughly**
   - Validate agent responses with test datasets
   - Monitor for hallucinations
   - Use evaluation metrics
   - Iterate on prompts based on results

4. **Handle Errors Gracefully**
   - Implement proper error handling
   - Provide fallback responses
   - Log failures for analysis

### Models

1. **Version Control**
   - Keep track of model versions and configurations
   - Document prompt templates and parameters
   - Test before deploying to production

2. **Monitor Performance**
   - Track prediction accuracy
   - Monitor response times
   - Set up automated retraining jobs
   - Log predictions for analysis

3. **Optimize Costs**
   - Use smaller models when appropriate
   - Batch predictions when possible
   - Cache frequently requested predictions
   - Monitor API usage

### Data Connections

1. **Secure Credentials**
   - Use environment variables for sensitive data
   - Rotate credentials regularly
   - Limit database user permissions
   - Never commit credentials to version control

2. **Optimize Queries**
   - Use indexes on source databases
   - Filter data early in the pipeline
   - Batch operations when possible
   - Monitor query performance

3. **Handle Connection Failures**
   - Implement retry logic
   - Set appropriate timeouts
   - Log connection errors
   - Use connection pooling

---

## Complete RAG Examples

### Example 1: Documentation Search System

```javascript
// Complete RAG implementation with JavaScript

import MindsDB from 'mindsdb-js-sdk';

// 1. Connect to MindsDB
await MindsDB.connect({
  host: 'http://127.0.0.1:47334'
});

// 2. Create database connection
const createDatabaseQuery = `
  CREATE DATABASE docs_db
  WITH ENGINE = 'postgres',
  PARAMETERS = {
    "host": "localhost",
    "database": "documentation",
    "user": "postgres",
    "password": "${process.env.DB_PASSWORD}"
  }
`;

await MindsDB.SQL.runQuery(createDatabaseQuery);

// 3. Create knowledge base
const createKBQuery = `
  CREATE KNOWLEDGE_BASE docs_kb
  USING
    embedding_model = {
      "provider": "openai",
      "model_name": "text-embedding-3-large",
      "api_key": "${process.env.OPENAI_API_KEY}"
    },
    reranking_model = {
      "provider": "openai",
      "model_name": "gpt-4o",
      "api_key": "${process.env.OPENAI_API_KEY}"
    },
    metadata_columns = ['category', 'last_updated'],
    content_columns = ['title', 'content'],
    id_column = 'doc_id'
`;

await MindsDB.SQL.runQuery(createKBQuery);

// 4. Insert documentation
const insertQuery = `
  INSERT INTO docs_kb
  SELECT 
    doc_id,
    title,
    content,
    category,
    last_updated
  FROM docs_db.documents
`;

await MindsDB.SQL.runQuery(insertQuery);

// 5. Create skills
const createDocsSkill = `
  CREATE SKILL docs_skill
  USING
    type = 'knowledge_base',
    source = 'docs_kb',
    description = 'Technical documentation and guides'
`;

await MindsDB.SQL.runQuery(createDocsSkill);

const createStatsSkill = `
  CREATE SKILL stats_skill
  USING
    type = 'text2sql',
    database = 'docs_db',
    tables = ['usage_stats', 'feedback'],
    description = 'Documentation usage statistics and user feedback'
`;

await MindsDB.SQL.runQuery(createStatsSkill);

// 6. Create agent
const createAgentQuery = `
  CREATE AGENT docs_assistant
  USING
    model = {
      "provider": "openai",
      "model_name": "gpt-4o",
      "api_key": "${process.env.OPENAI_API_KEY}"
    },
    skills = ['docs_skill', 'stats_skill'],
    prompt_template = '
      You are a helpful documentation assistant.
      
      Use docs_skill to answer questions about features, setup, and usage.
      Use stats_skill to provide statistics and analytics about documentation usage.
      
      Always:
      - Cite specific documentation sections when relevant
      - Be concise but complete
      - Ask clarifying questions if needed
      - Admit when you don\'t know something
    '
`;

await MindsDB.SQL.runQuery(createAgentQuery);

// 7. Query the agent
const askAgent = async (question) => {
  const query = `
    SELECT answer
    FROM docs_assistant
    WHERE question = '${question}'
  `;
  
  const result = await MindsDB.SQL.runQuery(query);
  return result[0].answer;
};

// Usage
const answer = await askAgent('How do I set up authentication?');
console.log(answer);
```

### Example 2: Customer Support RAG with REST API

```javascript
// Complete customer support system using REST API

const API_BASE = 'http://localhost:47334/api';
const PROJECT = 'mindsdb';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return await response.json();
};

// Helper for SQL queries
const runSQL = async (query) => {
  return await apiCall('/sql/query', 'POST', { query });
};

// 1. Create knowledge base from support articles
const setupKnowledgeBase = async () => {
  const kb = await apiCall(`/projects/${PROJECT}/knowledge_bases`, 'POST', {
    name: 'support_kb',
    embedding_model: {
      provider: 'openai',
      model_name: 'text-embedding-3-large',
      api_key: process.env.OPENAI_API_KEY
    },
    storage: {
      provider: 'chromadb'
    },
    metadata_columns: ['category', 'priority', 'date'],
    content_columns: ['title', 'article_content'],
    id_column: 'article_id'
  });
  
  console.log('Knowledge base created:', kb);
  
  // Insert articles from database
  await runSQL(`
    INSERT INTO support_kb
    SELECT article_id, title, article_content, category, priority, date
    FROM support_db.articles
  `);
  
  console.log('Articles inserted into knowledge base');
};

// 2. Create agent with skills
const setupAgent = async () => {
  // Create KB skill
  await runSQL(`
    CREATE SKILL kb_skill
    USING
      type = 'knowledge_base',
      source = 'support_kb',
      description = 'Support articles, FAQs, and troubleshooting guides'
  `);
  
  // Create text-to-SQL skill for ticket history
  await runSQL(`
    CREATE SKILL tickets_skill
    USING
      type = 'text2sql',
      database = 'support_db',
      tables = ['tickets', 'customers'],
      description = 'Customer ticket history and support interactions'
  `);
  
  // Create agent
  const agent = await apiCall(`/projects/${PROJECT}/agents`, 'POST', {
    name: 'support_agent',
    model: {
      provider: 'openai',
      model_name: 'gpt-4o',
      api_key: process.env.OPENAI_API_KEY
    },
    skills: ['kb_skill', 'tickets_skill'],
    prompt_template: `
      You are a customer support agent with access to:
      - kb_skill: Support articles and troubleshooting guides
      - tickets_skill: Customer ticket history
      
      Guidelines:
      - Search the knowledge base first for solutions
      - Check customer history for context
      - Provide step-by-step instructions
      - Be empathetic and professional
      - Escalate if issue is beyond your knowledge
    `
  });
  
  console.log('Agent created:', agent);
};

// 3. Query the agent
const handleCustomerQuery = async (customerId, question) => {
  const response = await apiCall(
    `/projects/${PROJECT}/agents/support_agent/completions`,
    'POST',
    {
      messages: [{
        question: `Customer ID: ${customerId}\nQuestion: ${question}`,
        answer: null
      }]
    }
  );
  
  return response.answer || response.messages[0].answer;
};

// 4. Query with streaming
const handleCustomerQueryStream = async (customerId, question) => {
  const response = await fetch(
    `${API_BASE}/projects/${PROJECT}/agents/support_agent/completions/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          question: `Customer ID: ${customerId}\nQuestion: ${question}`,
          answer: ''
        }]
      })
    }
  );
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'chunk') {
            process.stdout.write(data.content);
            fullAnswer += data.content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
  
  return fullAnswer;
};

// 5. Search knowledge base directly
const searchKB = async (query, filters = {}) => {
  let whereClause = `content LIKE '${query}'`;
  
  if (filters.category) {
    whereClause += ` AND metadata.category = '${filters.category}'`;
  }
  if (filters.minScore) {
    whereClause += ` AND relevance_score > ${filters.minScore}`;
  }
  
  const sqlQuery = `
    SELECT content, metadata, relevance_score
    FROM support_kb
    WHERE ${whereClause}
    LIMIT ${filters.limit || 5}
  `;
  
  return await runSQL(sqlQuery);
};

// Usage example
const main = async () => {
  try {
    // Setup (run once)
    await setupKnowledgeBase();
    await setupAgent();
    
    // Handle customer queries
    const answer = await handleCustomerQuery(
      'CUST123',
      'My order hasn\'t arrived yet'
    );
    console.log('Agent response:', answer);
    
    // Direct KB search
    const kbResults = await searchKB('shipping delays', {
      category: 'shipping',
      minScore: 0.7,
      limit: 3
    });
    console.log('KB search results:', kbResults);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the application
main();
```

### Example 3: Multi-Tenant RAG System

```javascript
// Multi-tenant documentation system with partitioned knowledge base

import MindsDB from 'mindsdb-js-sdk';

await MindsDB.connect({ host: 'http://127.0.0.1:47334' });

// 1. Create partitioned knowledge base
const createPartitionedKB = async () => {
  const query = `
    CREATE KNOWLEDGE_BASE tenant_docs_kb
    USING
      embedding_model = {
        "provider": "openai",
        "model_name": "text-embedding-3-large",
        "api_key": "${process.env.OPENAI_API_KEY}"
      },
      metadata_columns = ['tenant_id', 'category', 'version'],
      content_columns = ['title', 'content'],
      id_column = 'doc_id'
  `;
  
  await MindsDB.SQL.runQuery(query);
};

// 2. Insert documents with tenant partitioning
const insertTenantDocuments = async (tenantId) => {
  const query = `
    INSERT INTO tenant_docs_kb
    SELECT doc_id, title, content, '${tenantId}' as tenant_id, category, version
    FROM docs_db.documents
    WHERE tenant_id = '${tenantId}'
    USING
      partition_column = 'tenant_id',
      batch_size = 500,
      threads = 8
  `;
  
  await MindsDB.SQL.runQuery(query);
};

// 3. Query for specific tenant
const searchTenantDocs = async (tenantId, searchQuery) => {
  const query = `
    SELECT content, metadata, relevance_score
    FROM tenant_docs_kb
    WHERE content LIKE '${searchQuery}'
      AND metadata.tenant_id = '${tenantId}'
    LIMIT 10
  `;
  
  const results = await MindsDB.SQL.runQuery(query);
  return results;
};

// 4. Create tenant-specific agents
const createTenantAgent = async (tenantId, tenantName) => {
  // Create tenant-specific skill
  await MindsDB.SQL.runQuery(`
    CREATE SKILL tenant_${tenantId}_skill
    USING
      type = 'knowledge_base',
      source = 'tenant_docs_kb',
      description = 'Documentation for ${tenantName}'
  `);
  
  // Create agent for this tenant
  await MindsDB.SQL.runQuery(`
    CREATE AGENT tenant_${tenantId}_agent
    USING
      model = {
        "provider": "openai",
        "model_name": "gpt-4o",
        "api_key": "${process.env.OPENAI_API_KEY}"
      },
      skills = ['tenant_${tenantId}_skill'],
      prompt_template = '
        You are a documentation assistant for ${tenantName}.
        Only use information from their specific documentation.
        Always maintain data isolation between tenants.
      '
  `);
};

// Usage
await createPartitionedKB();
await insertTenantDocuments('tenant_001');
await insertTenantDocuments('tenant_002');

const results = await searchTenantDocs('tenant_001', 'API authentication');
console.log(results);
```

### Example 4: Express.js API with MindsDB RAG

```javascript
// Complete Express.js REST API with MindsDB RAG backend

import express from 'express';
import MindsDB from 'mindsdb-js-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize MindsDB connection
let mindsdbConnected = false;

const initMindsDB = async () => {
  try {
    await MindsDB.connect({
      host: process.env.MINDSDB_HOST || 'http://127.0.0.1:47334'
    });
    mindsdbConnected = true;
    console.log('Connected to MindsDB');
  } catch (error) {
    console.error('Failed to connect to MindsDB:', error);
  }
};

// Middleware to check MindsDB connection
const checkMindsDB = (req, res, next) => {
  if (!mindsdbConnected) {
    return res.status(503).json({ error: 'MindsDB not connected' });
  }
  next();
};

// Search knowledge base endpoint
app.post('/api/search', checkMindsDB, async (req, res) => {
  try {
    const { query, limit = 10, minScore = 0.5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const sqlQuery = `
      SELECT content, metadata, relevance_score
      FROM docs_kb
      WHERE content LIKE '${query}'
        AND relevance_score > ${minScore}
      LIMIT ${limit}
    `;
    
    const results = await MindsDB.SQL.runQuery(sqlQuery);
    
    res.json({
      success: true,
      results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Query agent endpoint
app.post('/api/ask', checkMindsDB, async (req, res) => {
  try {
    const { question, agentName = 'docs_assistant' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const query = `
      SELECT answer
      FROM ${agentName}
      WHERE question = '${question.replace(/'/g, "''")}'
    `;
    
    const result = await MindsDB.SQL.runQuery(query);
    
    res.json({
      success: true,
      question,
      answer: result[0]?.answer || 'No answer generated',
      agent: agentName
    });
    
  } catch (error) {
    console.error('Agent query error:', error);
    res.status(500).json({ error: 'Query failed', message: error.message });
  }
});

// Streaming agent response endpoint
app.post('/api/ask/stream', checkMindsDB, async (req, res) => {
  try {
    const { question, agentName = 'docs_assistant' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const apiResponse = await fetch(
      `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions/stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ question, answer: '' }]
        })
      }
    );
    
    const reader = apiResponse.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      res.write(chunk);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Insert documents endpoint
app.post('/api/documents', checkMindsDB, async (req, res) => {
  try {
    const { kbName, documents } = req.body;
    
    if (!kbName || !documents || !Array.isArray(documents)) {
      return res.status(400).json({ 
        error: 'Knowledge base name and documents array required' 
      });
    }
    
    // Insert documents (assuming they come from an uploaded file or external source)
    for (const doc of documents) {
      const query = `
        INSERT INTO ${kbName}
        SELECT '${doc.id}' as id, '${doc.title}' as title, '${doc.content}' as content
      `;
      
      await MindsDB.SQL.runQuery(query);
    }
    
    res.json({
      success: true,
      message: `Inserted ${documents.length} documents into ${kbName}`,
      count: documents.length
    });
    
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Insert failed', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mindsdb: mindsdbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// List knowledge bases endpoint
app.get('/api/knowledge-bases', checkMindsDB, async (req, res) => {
  try {
    const query = 'SELECT * FROM information_schema.knowledge_bases';
    const kbs = await MindsDB.SQL.runQuery(query);
    
    res.json({
      success: true,
      knowledge_bases: kbs
    });
    
  } catch (error) {
    console.error('List KB error:', error);
    res.status(500).json({ error: 'Failed to list knowledge bases' });
  }
});

// List agents endpoint
app.get('/api/agents', checkMindsDB, async (req, res) => {
  try {
    const response = await fetch('http://localhost:47334/api/projects/mindsdb/agents');
    const agents = await response.json();
    
    res.json({
      success: true,
      agents
    });
    
  } catch (error) {
    console.error('List agents error:', error);
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

initMindsDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
```

---

## TypeScript Integration

### TypeScript Setup

```typescript
// types.ts - Define MindsDB types for your application

export interface KnowledgeBaseConfig {
  name: string;
  embedding_model: {
    provider: string;
    model_name: string;
    api_key: string;
  };
  reranking_model?: {
    provider: string;
    model_name: string;
    api_key: string;
  };
  storage?: {
    provider: string;
  };
  metadata_columns?: string[];
  content_columns?: string[];
  id_column?: string;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  relevance_score: number;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  filters?: Record<string, any>;
}

export interface AgentConfig {
  name: string;
  model: {
    provider: string;
    model_name: string;
    api_key: string;
  };
  skills: string[];
  prompt_template?: string;
}

export interface AgentResponse {
  answer: string;
  question: string;
  agent: string;
}
```

### TypeScript Service Class

```typescript
// mindsdb-service.ts - MindsDB service wrapper

import MindsDB from 'mindsdb-js-sdk';
import type { 
  KnowledgeBaseConfig, 
  SearchResult, 
  SearchOptions,
  AgentConfig,
  AgentResponse 
} from './types';

export class MindsDBService {
  private connected: boolean = false;
  private host: string;

  constructor(host: string = 'http://127.0.0.1:47334') {
    this.host = host;
  }

  async connect(): Promise<void> {
    try {
      await MindsDB.connect({ host: this.host });
      this.connected = true;
      console.log('Connected to MindsDB');
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Not connected to MindsDB. Call connect() first.');
    }
  }

  async createKnowledgeBase(config: KnowledgeBaseConfig): Promise<void> {
    this.ensureConnected();
    
    const embeddingModelStr = JSON.stringify(config.embedding_model).replace(/"/g, '\\"');
    const rerankingModelStr = config.reranking_model 
      ? JSON.stringify(config.reranking_model).replace(/"/g, '\\"')
      : null;
    
    let query = `
      CREATE KNOWLEDGE_BASE ${config.name}
      USING
        embedding_model = "${embeddingModelStr}"
    `;
    
    if (rerankingModelStr) {
      query += `,\n        reranking_model = "${rerankingModelStr}"`;
    }
    
    if (config.storage) {
      const storageStr = JSON.stringify(config.storage).replace(/"/g, '\\"');
      query += `,\n        storage = "${storageStr}"`;
    }
    
    if (config.metadata_columns) {
      query += `,\n        metadata_columns = [${config.metadata_columns.map(c => `'${c}'`).join(', ')}]`;
    }
    
    if (config.content_columns) {
      query += `,\n        content_columns = [${config.content_columns.map(c => `'${c}'`).join(', ')}]`;
    }
    
    if (config.id_column) {
      query += `,\n        id_column = '${config.id_column}'`;
    }
    
    await MindsDB.SQL.runQuery(query);
  }

  async search(
    kbName: string, 
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    this.ensureConnected();
    
    const { limit = 10, minScore = 0.5, filters = {} } = options;
    
    let whereClause = `content LIKE '${query}'`;
    
    if (minScore) {
      whereClause += ` AND relevance_score > ${minScore}`;
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      whereClause += ` AND metadata.${key} = '${value}'`;
    });
    
    const sqlQuery = `
      SELECT content, metadata, relevance_score
      FROM ${kbName}
      WHERE ${whereClause}
      LIMIT ${limit}
    `;
    
    const results = await MindsDB.SQL.runQuery(sqlQuery);
    return results as SearchResult[];
  }

  async createAgent(config: AgentConfig): Promise<void> {
    this.ensureConnected();
    
    const modelStr = JSON.stringify(config.model).replace(/"/g, '\\"');
    const skillsStr = config.skills.map(s => `'${s}'`).join(', ');
    
    let query = `
      CREATE AGENT ${config.name}
      USING
        model = "${modelStr}",
        skills = [${skillsStr}]
    `;
    
    if (config.prompt_template) {
      query += `,\n        prompt_template = '${config.prompt_template.replace(/'/g, "''")}'`;
    }
    
    await MindsDB.SQL.runQuery(query);
  }

  async queryAgent(
    agentName: string, 
    question: string
  ): Promise<AgentResponse> {
    this.ensureConnected();
    
    const query = `
      SELECT answer
      FROM ${agentName}
      WHERE question = '${question.replace(/'/g, "''")}'
    `;
    
    const result = await MindsDB.SQL.runQuery(query);
    
    return {
      answer: result[0]?.answer || 'No answer generated',
      question,
      agent: agentName
    };
  }

  async insertDocuments(
    kbName: string,
    sourceQuery: string
  ): Promise<void> {
    this.ensureConnected();
    
    const query = `
      INSERT INTO ${kbName}
      ${sourceQuery}
    `;
    
    await MindsDB.SQL.runQuery(query);
  }
}

// Export singleton instance
export const mindsdb = new MindsDBService();
```

### Usage in TypeScript Application

```typescript
// app.ts - Main application

import { mindsdb } from './mindsdb-service';
import type { KnowledgeBaseConfig, AgentConfig } from './types';

async function main() {
  try {
    // Connect to MindsDB
    await mindsdb.connect();
    
    // Create knowledge base
    const kbConfig: KnowledgeBaseConfig = {
      name: 'docs_kb',
      embedding_model: {
        provider: 'openai',
        model_name: 'text-embedding-3-large',
        api_key: process.env.OPENAI_API_KEY!
      },
      metadata_columns: ['category', 'date'],
      content_columns: ['title', 'content'],
      id_column: 'doc_id'
    };
    
    await mindsdb.createKnowledgeBase(kbConfig);
    
    // Insert documents
    await mindsdb.insertDocuments(
      'docs_kb',
      'SELECT doc_id, title, content, category, date FROM postgres_conn.documents'
    );
    
    // Create agent
    const agentConfig: AgentConfig = {
      name: 'docs_assistant',
      model: {
        provider: 'openai',
        model_name: 'gpt-4o',
        api_key: process.env.OPENAI_API_KEY!
      },
      skills: ['kb_skill'],
      prompt_template: 'You are a helpful documentation assistant.'
    };
    
    await mindsdb.createAgent(agentConfig);
    
    // Search knowledge base
    const searchResults = await mindsdb.search('docs_kb', 'authentication', {
      limit: 5,
      minScore: 0.7,
      filters: { category: 'security' }
    });
    
    console.log('Search results:', searchResults);
    
    // Query agent
    const response = await mindsdb.queryAgent(
      'docs_assistant',
      'How do I configure OAuth?'
    );
    
    console.log('Agent response:', response.answer);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

## Environment Variables

Create a `.env` file in your project root:

```bash
# MindsDB Connection
MINDSDB_HOST=http://127.0.0.1:47334
MINDSDB_EMAIL=your_email@domain.com
MINDSDB_PASSWORD=your_password

# API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Database Connections
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=mydb
MYSQL_USER=root
MYSQL_PASSWORD=password

# Application
PORT=3000
NODE_ENV=development
```

---

## GitHub Copilot Context Instructions

When working with this MindsDB project:

1. **Always use environment variables** for sensitive data (API keys, passwords)
2. **Error handling**: Wrap MindsDB calls in try-catch blocks
3. **Async/await**: All MindsDB operations are asynchronous
4. **SQL injection**: Use parameterized queries or escape single quotes
5. **Knowledge base queries**: Use `LIKE` operator for semantic search
6. **Agent queries**: Pass questions in WHERE clause
7. **REST API**: Use fetch with proper headers and error handling
8. **Streaming**: Handle Server-Sent Events for streaming responses
9. **TypeScript**: Use proper types from mindsdb-js-sdk
10. **Testing**: Always test with small datasets first

### Common Patterns:

**Create and populate KB:**
```javascript
// 1. Create
await MindsDB.SQL.runQuery(`CREATE KNOWLEDGE_BASE my_kb USING ...`);
// 2. Insert
await MindsDB.SQL.runQuery(`INSERT INTO my_kb SELECT ... FROM source`);
// 3. Query
const results = await MindsDB.SQL.runQuery(`SELECT * FROM my_kb WHERE content LIKE '...'`);
```

**Create and use Agent:**
```javascript
// 1. Create skills
await MindsDB.SQL.runQuery(`CREATE SKILL ... USING type = 'knowledge_base'`);
// 2. Create agent
await MindsDB.SQL.runQuery(`CREATE AGENT ... USING model = {...}, skills = [...]`);
// 3. Query
const answer = await MindsDB.SQL.runQuery(`SELECT * FROM agent WHERE question = '...'`);
```

---

## Quick Reference Card

### JavaScript SDK Essentials
```javascript
// Connect
await MindsDB.connect({ host: 'http://127.0.0.1:47334' });

// Execute SQL
await MindsDB.SQL.runQuery('SELECT * FROM kb WHERE content LIKE "query"');

// Models
const model = await MindsDB.Models.getModel('model_name', 'project');
await model.query({ where: ['input = "value"'] });

// Projects
const projects = await MindsDB.Projects.getAllProjects();
```

### REST API Essentials
```javascript
// SQL Query
fetch('http://localhost:47334/api/sql/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'SELECT ...' })
});

// Agent Query
fetch('http://localhost:47334/api/projects/mindsdb/agents/agent_name/completions', {
  method: 'POST',
  body: JSON.stringify({ messages: [{ question: '...', answer: null }] })
});
```

### File Format Recommendation

For GitHub Copilot, save this as:
- **`.github/copilot-instructions.md`** (recommended - Copilot reads this automatically)
- **`MINDSDB_CONTEXT.md`** (in project root)
- **`docs/mindsdb-reference.md`** (in docs folder)

You can also add specific instructions in comments:
```javascript
// @context: See MINDSDB_CONTEXT.md for MindsDB RAG implementation details
```

---

## Additional Resources

- **Official Docs**: https://docs.mindsdb.com
- **JavaScript SDK**: https://docs.mindsdb.com/sdks/javascript/overview
- **REST API**: https://docs.mindsdb.com/rest/overview
- **GitHub**: https://github.com/mindsdb/mindsdb
- **Community**: Slack, Discord
- **Tutorials**: https://docs.mindsdb.com/use-cases

---

*This comprehensive guide provides complete context for building RAG applications with MindsDB using JavaScript SDK and REST APIs. Use it as reference for GitHub Copilot assistance.*: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        embedding_model: config.embedding_model,
        reranking_model: config.reranking_model,
        storage: config.storage,
        metadata_columns: config.metadata_columns,
        content_columns: config.content_columns,
        id_column: config.id_column
      })
    }
  );
  
  return await response.json();
};

// Usage
const kb = await createKnowledgeBase('docs_kb', {
  embedding_model: {
    provider: 'openai',
    model_name: 'text-embedding-3-large',
    api_key: process.env.OPENAI_API_KEY
  },
  storage: { provider: 'chromadb' },
  metadata_columns: ['category', 'date'],
  content_columns: ['title', 'content'],
  id_column: 'doc_id'
});
```

#### Insert Into Knowledge Base
Use SQL endpoint to insert data:
```javascript
const insertIntoKB = async (kbName, data) => {
  // For data from a database
  const query = `
    INSERT INTO ${kbName}
    SELECT id, title, content, category, date
    FROM postgres_conn.documents
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};
```

#### Query Knowledge Base
```javascript
const queryKnowledgeBase = async (kbName, searchQuery, limit = 10) => {
  const query = `
    SELECT content, metadata, relevance_score
    FROM ${kbName}
    WHERE content LIKE '${searchQuery}'
    LIMIT ${limit}
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};

// Usage
const results = await queryKnowledgeBase(
  'docs_kb',
  'how to configure authentication',
  5
);
```

#### Delete Knowledge Base
```bash
curl -X DELETE http://localhost:47334/api/projects/mindsdb/knowledge_bases/my_kb
```

### AI Agents

#### List Agents
```bash
curl http://localhost:47334/api/projects/mindsdb/agents
```

**JavaScript Example:**
```javascript
const listAgents = async () => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/agents'
  );
  return await response.json();
};
```

#### Get Agent Details
```bash
curl http://localhost:47334/api/projects/mindsdb/agents/my_agent
```

#### Create Agent
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "support_agent",
    "model": {
      "provider": "openai",
      "model_name": "gpt-4o",
      "api_key": "sk-xxx"
    },
    "skills": ["kb_skill", "text2sql_skill"]
  }'
```

**JavaScript Example:**
```javascript
const createAgent = async (agentConfig) => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/agents',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: agentConfig.name,
        model: agentConfig.model,
        skills: agentConfig.skills,
        prompt_template: agentConfig.prompt_template
      })
    }
  );
  
  return await response.json();
};

// Usage
const agent = await createAgent({
  name: 'support_agent',
  model: {
    provider: 'openai',
    model_name: 'gpt-4o',
    api_key: process.env.OPENAI_API_KEY
  },
  skills: ['kb_skill', 'text2sql_skill'],
  prompt_template: `
    You are a helpful support agent with access to:
    - kb_skill: Product documentation
    - text2sql_skill: Customer database
    
    Always be professional and concise.
  `
});
```

#### Query Agent (Completions)
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/agents/support_agent/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "question": "How do I reset my password?",
        "answer": null
      }
    ]
  }'
```

**JavaScript Example:**
```javascript
const queryAgent = async (agentName, question) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ question, answer: null }]
      })
    }
  );
  
  const result = await response.json();
  return result;
};

// Usage
const response = await queryAgent('support_agent', 'How do I reset my password?');
console.log(response.answer);
```

#### Query Agent (Streaming)
```bash
curl -X POST http://localhost:47334/api/projects/mindsdb/agents/support_agent/completions/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "question": "What is MindsDB?",
        "answer": ""
      }
    ]
  }'
```

**JavaScript Example (Server-Sent Events):**
```javascript
const queryAgentStream = async (agentName, question, onChunk) => {
  const response = await fetch(
    `http://localhost:47334/api/projects/mindsdb/agents/${agentName}/completions/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ question, answer: '' }]
      })
    }
  );
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onChunk(data);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
};

// Usage
await queryAgentStream('support_agent', 'What is MindsDB?', (data) => {
  console.log('Chunk:', data);
  if (data.type === 'answer') {
    console.log('Final answer:', data.content);
  }
});
```

#### Update Agent
```bash
curl -X PUT http://localhost:47334/api/projects/mindsdb/agents/support_agent \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "provider": "anthropic",
      "model_name": "claude-3-opus",
      "api_key": "sk-xxx"
    },
    "skills": ["kb_skill", "text2sql_skill", "new_skill"]
  }'
```

#### Delete Agent
```bash
curl -X DELETE http://localhost:47334/api/projects/mindsdb/agents/support_agent
```

### Skills

#### List Skills
```bash
curl http://localhost:47334/api/projects/mindsdb/skills
```

#### Get Skill
```bash
curl http://localhost:47334/api/projects/mindsdb/skills/kb_skill
```

#### Create Skill
Use SQL endpoint to create skills:
```javascript
const createSkill = async (skillConfig) => {
  const query = `
    CREATE SKILL ${skillConfig.name}
    USING
      type = '${skillConfig.type}',
      source = '${skillConfig.source}',
      description = '${skillConfig.description}'
  `;
  
  const response = await fetch('http://localhost:47334/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return await response.json();
};

// Knowledge Base skill
await createSkill({
  name: 'kb_skill',
  type: 'knowledge_base',
  source: 'docs_kb',
  description: 'Product documentation and user guides'
});

// Text-to-SQL skill
await createSkill({
  name: 'text2sql_skill',
  type: 'text2sql',
  source: 'postgres_conn.customers, postgres_conn.orders',
  description: 'Customer and order data from 2020-2024'
});
```

---

## Knowledge Bases (RAG)

### Architecture Components

1. **Embedding Models**: Convert text to vectors
   - OpenAI: `text-embedding-3-small`, `text-embedding-3-large`
   - Azure OpenAI: Azure-hosted embeddings
   - Hugging Face: Any sentence-transformers model

2. **Vector Stores**: Store embeddings
   - ChromaDB (default, local)
   - PGVector (PostgreSQL extension, recommended for production)

3. **Reranking Models**: Improve relevance of retrieved results
   - OpenAI models (GPT-4o, GPT-4)

4. **Automatic Chunking**: Split documents intelligently

5. **Metadata Filtering**: Filter by structured attributes

### Creating Knowledge Bases

#### Basic Creation (Auto-configuration)
```sql
CREATE KNOWLEDGE_BASE my_kb;
```

**JavaScript SDK:**
```javascript
// Use SQL query
const query = 'CREATE KNOWLEDGE_BASE my_kb';
await MindsDB.SQL.runQuery(query);
```

**REST API:**
```javascript
const createKB = async () => {
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/knowledge_bases',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'my_kb' })
    }
  );
  return await response.json();
};
```

#### Advanced Creation with Custom Configuration

**SQL:**
```sql
CREATE KNOWLEDGE_BASE docs_kb
USING
  embedding_model = {
    "provider": "openai",
    "model_name": "text-embedding-3-large",
    "api_key": "sk-xxx"
  },
  reranking_model = {
    "provider": "openai",
    "model_name": "gpt-4o",
    "api_key": "sk-xxx"
  },
  storage = {
    "provider": "chromadb"
  },
  metadata_columns = ['date', 'author', 'category'],
  content_columns = ['title', 'content', 'description'],
  id_column = 'doc_id';
```

**REST API:**
```javascript
const createAdvancedKB = async () => {
  const config = {
    name: 'docs_kb',
    embedding_model: {
      provider: 'openai',
      model_name: 'text-embedding-3-large',
      api_key: process.env.OPENAI_API_KEY
    },
    reranking_model: {
      provider: 'openai',
      model_name: 'gpt-4o',
      api_key: process.env.OPENAI_API_KEY
    },
    storage: {
      provider: 'chromadb'
    },
    metadata_columns: ['date', 'author', 'category'],
    content_columns: ['title', 'content', 'description'],
    id_column: 'doc_id'
  };
  
  const response = await fetch(
    'http://localhost:47334/api/projects/mindsdb/knowledge_bases',
    {
      method: 'POST',
      headers