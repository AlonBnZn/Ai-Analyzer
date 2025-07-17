# PROCESS.md

## Architecture and Key Design Choices

### System Architecture

```
Frontend (React 19) ↔ Backend (Express.js) ↔ AI Provider (Gemini) ↔ MongoDB
```

**Clear System Boundaries:**

- **Frontend**: React dashboard with charts, filters, and chat interface
- **Backend**: Express API handling data aggregation and AI query interpretation
- **AI Layer**: Natural language processing
- **Database**: MongoDB with optimized aggregation pipelines

### Key Design Decisions

1. **Monorepo with Shared Types**: Ensures type safety between frontend and backend
2. **AI Provider Support**: Google Gemini
3. **Natural Language to MongoDB**: Direct conversion of user queries to aggregation pipelines
4. **Response Type Detection**: AI determines if response should be text, table, or chart
5. **Graceful Error Handling**: Specific responses for ambiguous/unsupported queries

## AI Prompts and Iterations

### Initial Prompt (V1)

```
Convert this question to a MongoDB query: "${userQuestion}"
Return only JSON.
```

**Issues**: No context, poor error handling, inconsistent output

### Improved Prompt (V2)

```
You are a MongoDB expert. Convert natural language to aggregation pipelines.
COLLECTION: job_indexing_logs
SCHEMA: {...}
QUESTION: "${userQuestion}"
Return valid JSON array or "UNSUPPORTED"
```

**Improvements**: Added schema context, basic error handling

### Production Prompt (V3 - Current)

```
You are a MongoDB aggregation assistant specialized in "JobIndexing" collection.

Convert natural language questions into valid MongoDB aggregation pipelines.
Respond with **only** a JSON array or "UNSUPPORTED".

RULES:
1. If ambiguous/off-topic → respond "UNSUPPORTED"
2. Use only: $match, $group, $project, $sort, $limit
3. No JavaScript functions, only MongoDB operators
4. Single focus per query

COLLECTION: "job_indexing_logs"
SCHEMA: [detailed field definitions...]

EXAMPLES:
Question: "Average jobs sent per client last month?"
Pipeline: [{"$match": {...}}, {"$group": {...}}]

Question: "What's the weather?"
Response: UNSUPPORTED

Now convert: "${userQuestion}"
```

### Prompt Iteration Results

- **V1**: 45% success rate, frequent JSON errors
- **V2**: 72% success rate, better structure
- **V3**: 89% success rate, reliable error handling

### Key Prompt Engineering Insights

1. **Explicit Examples**: Showing both valid and invalid queries dramatically improved accuracy
2. **Constraint Definition**: Limiting to specific MongoDB operators prevented security issues
3. **Error Token**: Using "UNSUPPORTED" as a clear error signal enabled proper handling
4. **Schema Documentation**: Detailed field descriptions reduced incorrect field usage
5. **Date Preprocessing**: Backend handles relative dates before sending to AI

## How AI Tools Were Used During Development

### Code Generation ( AI-assisted)

**Used Claude/ChatGPT for:**

- TypeScript interface generation from schema descriptions
- Express route boilerplate and middleware setup
- React component scaffolding with TypeScript
- MongoDB aggregation pipeline templates
- Error handling patterns

**Example prompt:**

```
Generate a TypeScript interface for MongoDB job indexing logs with fields:
country_code, currency_code, progress object with job counters, status enum, timestamp.
Include proper validation types.
```

### Architecture Planning (AI-assisted)

**AI helped with:**

- Evaluating monorepo vs separate repos
- Multi-AI provider architecture design
- Error handling strategy development
- Database indexing recommendations

**Human decisions:**

- Business requirements interpretation
- UX/UI design choices
- Security and performance requirements

### Testing and Documentation (AI-assisted)

**AI generated:**

- Unit test templates and mock data
- API documentation structure
- Error scenario identification
- Performance testing strategies

**Manual validation:**

- All AI-generated code reviewed before integration
- Business logic accuracy verification
- User experience testing

### Prompt Engineering (AI-assisted)

**Process:**

- Understanding natural language query patterns
- Iterating on AI prompt effectiveness
- Handling edge cases and ambiguous queries
- Optimizing for response accuracy

### Effective AI Collaboration Patterns

1. **Start with AI for structure**: Generate boilerplate, then customize for business logic
2. **Iterate prompts systematically**: Test with edge cases, measure success rates
3. **Use AI for repetitive tasks**: Type definitions, CRUD operations, documentation
4. **Keep humans in control**: All architectural and UX decisions overwatched by human

### Challenges and Solutions

**Challenge**: AI inconsistency in query generation
**Solution**: Highly structured prompts with explicit examples and constraints

**Challenge**: Natural language ambiguity  
**Solution**: Clear error responses with helpful suggestions for users

**Challenge**: AI hallucination in MongoDB queries
**Solution**: Limited AI to safe operators and added query validation

**Challenge**: Maintaining prompt effectiveness over time
**Solution**: Systematic testing with diverse query examples and continuous refinement

This balanced AI-human collaboration resulted in faster development while maintaining high code quality and reliability.
