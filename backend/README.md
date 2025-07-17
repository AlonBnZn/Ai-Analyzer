# Botson AI Backend - Screen B Chat Assistant

This backend provides AI-powered chat functionality for the Botson AI Analyzer platform, specifically for "Screen B" - the AI Chat Assistant feature.

## Features

- 🤖 **Multi-AI Provider Support**: Works with both OpenAI GPT and Google Gemini
- 🔍 **MCP Integration**: Model Context Protocol for MongoDB query generation
- 📊 **Smart Query Interpretation**: Natural language to database query conversion
- 📈 **Multiple Response Formats**: Text, tables, and charts
- 🛡️ **Error Handling**: Graceful handling of ambiguous or unsupported queries
- ⚡ **Performance Optimized**: Efficient MongoDB aggregation pipelines

## Architecture

```
User Query → AI Interpretation → MCP MongoDB Query → Execution → Response Formatting
```

### Core Components

1. **ChatRoutes** (`/routes/chat.ts`): Express endpoints for chat functionality
2. **MCPMongoService**: Handles MongoDB query generation and execution
3. **AIService**: Multi-provider AI integration (OpenAI + Gemini)
4. **QueryInterpreter**: Natural language query analysis
5. **ResponseFormatter**: Dynamic response formatting (text/table/chart)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/botson-ai

# Primary AI Provider (openai or gemini)
PRIMARY_AI_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Server
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### POST `/api/chat/chat`

Send a natural language query to the AI assistant.

**Request:**

```json
{
  "message": "Average jobs sent per client last month?",
  "conversationId": "optional-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "response": "The average is 1,247 jobs per client based on 45 clients.",
  "type": "text",
  "data": { "average": 1247, "count": 45 },
  "conversationId": "uuid",
  "metadata": {
    "queryType": "metric",
    "dataPoints": 45,
    "executionTime": 156
  }
}
```

### Response Types

- **`text`**: Simple text response
- **`table`**: Tabular data for comparisons/listings
- **`chart`**: Chart data with chartType (line, bar, pie)

## Query Examples

The AI can handle various types of natural language queries:

### Metrics

- "What's the average jobs sent per client?"
- "Total jobs sent last month"
- "Count of unique countries"

### Comparisons

- "Top 5 clients by total jobs"
- "Which countries send the most jobs?"
- "Compare client performance"

### Trends

- "Show me daily job trends"
- "Monthly job volume over time"
- "Job growth pattern"

### Listings

- "Show me recent job data"
- "List all clients"
- "Display country data"

## MCP (Model Context Protocol) Integration

The system uses MCP for seamless AI-to-database query translation:

1. **Query Interpretation**: AI analyzes natural language
2. **Schema Mapping**: Maps concepts to database fields
3. **Pipeline Generation**: Creates MongoDB aggregation pipelines
4. **Execution**: Runs optimized database queries
5. **Result Formatting**: Formats data for presentation

## Database Schema

Expected MongoDB collection structure:

```javascript
{
  "_id": ObjectId,
  "TOTAL_JOBS_SENT_TO_INDEX": Number,
  "CLIENT_NAME": String,
  "COUNTRY": String,
  "date": Date,
  // ... other fields
}
```

## Error Handling

The system gracefully handles:

- **Ambiguous queries**: Provides clarification suggestions
- **Unsupported queries**: Offers alternative query examples
- **Database errors**: Fallback responses with error context
- **AI provider failures**: Automatic fallback between providers

## Development

### Adding New Query Types

1. Update `QueryInterpreter.interpretQuery()`
2. Add handling in `MCPMongoService.generateMongoQuery()`
3. Implement formatting in `ResponseFormatter.formatResponse()`

### Adding New AI Providers

1. Create service class implementing the AI interface
2. Update `AIService` to include new provider
3. Add provider configuration to environment variables

## Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check
```

## Logging

Logs are written to `./logs/` directory:

- `error.log`: Error level logs
- `warn.log`: Warning level logs
- `info.log`: Info level logs
- `all.log`: All logs combined

## Production Considerations

- Set `NODE_ENV=production`
- Use Redis for rate limiting and caching
- Implement proper authentication/authorization
- Monitor AI provider usage and costs
- Set up log rotation
- Use environment-specific database connections
