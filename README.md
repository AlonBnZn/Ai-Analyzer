# Botson AI Analyzer

A full-stack analytics platform with AI-powered natural language querying for job indexing data analysis.

## Features

**Screen A - Operations Dashboard**

- Interactive tables and charts to spot trends and outliers
- Filtering by date range, client, country with sorting and pagination
- Key metrics highlighting averages and deltas for decision-making

**Screen B - AI Chat Assistant**

- Natural language queries
- Backend interprets queries, executes MongoDB operations, responds as text/table/chart
- Graceful handling of ambiguous or unsupported questions

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Backend**: Node.js + Express In TypeScript
- **Database**: MongoDB
- **AI**: Google Gemini
- **Charts**: Recharts
- **Styling**: Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- MongoDB 4.4+
- Google Gemini API key

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd botson-ai-analyzer
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../shared && npm install && npm run build
```

2. **Configure environment variables**

```bash
# Backend (.env)
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/botson-ai
GEMINI_API_KEY=your_gemini_key_here
```

Note: If you need an API key for Gemini, you can create one for free online here: https://aistudio.google.com/app/apikey.

```bash
# Frontend (.env)
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

3. **Import sample data**

```bash
cd backend
npm run import-data
```

4. **Start the application**

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

5. **Access the application**

- Dashboard: http://localhost:3000
- API: http://localhost:5000

## Project Structure

```
├── README.md
├── PROCESS.md
├── frontend/          # React 19 dashboard
├── backend/           # Express.js API with AI integration
└── shared/            # Shared TypeScript types
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/dashboard/metrics` - Dashboard KPIs
- `GET /api/dashboard/data` - Filtered job logs
- `POST /api/assistant` - AI natural language queries

## Example AI Queries

- "Average TOTAL_JOBS_SENT_TO_INDEX per client last month?"
- "Top 5 clients by total jobs processed"
- "Which countries have the highest failure rates?"
- "Show me processing trends for the past week"
