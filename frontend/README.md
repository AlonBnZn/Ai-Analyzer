# Botson AI Analyzer - Frontend

A modern React dashboard for analyzing job indexing performance with AI-powered insights.

## 🚀 Features

- **📊 Analytics Dashboard** - Real-time metrics and performance monitoring
- **📈 Interactive Charts** - Time series, bar charts, and pie charts using Recharts
- **🔍 Advanced Filtering** - Multi-dimensional data filtering with quick presets
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **🤖 AI Assistant** - Natural language querying of data (placeholder for now)
- **⚡ Performance Optimized** - React Query for efficient data fetching
- **🎨 Modern UI** - Tailwind CSS 4.1 with custom design system

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **React Query** - Server state management and caching
- **Recharts** - Responsive chart library
- **Heroicons** - Beautiful SVG icons
- **Vite** - Fast build tool and development server
- **Date-fns** - Modern date utility library

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on localhost:5000

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all required packages
npm install

# Install shared types package
npm install @botson/shared@file:../shared
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
VITE_API_URL=http://localhost:5000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Tabs, Loading, Error)
│   ├── DashboardFilters.tsx
│   ├── MetricsCards.tsx
│   ├── ChartsSection.tsx
│   ├── LogsTable.tsx
│   └── ChatAssistant.tsx
├── pages/              # Page components
│   └── Dashboard.tsx   # Main analytics dashboard
├── services/           # API services
│   └── api.ts         # API service layer
├── App.tsx            # Root application component
├── App.css            # Global styles with Tailwind
└── main.tsx           # Application entry point
```

## 🎨 Design System

### Colors

- **Primary**: Blue (#3b82f6) - Main brand color
- **Success**: Green (#10b981) - Success states
- **Warning**: Yellow (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography

- **Font**: System font stack for optimal performance
- **Sizes**: Responsive text sizing using Tailwind utilities

### Components

- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Consistent hover and focus states
- **Tables**: Striped rows with hover effects
- **Charts**: Consistent color palette across all visualizations

## 📊 Dashboard Features

### Metrics Cards

- Total logs processed
- Jobs indexed vs failed
- Success rate calculations
- Processing time analytics
- Active client tracking

### Interactive Charts

- **Time Series**: Job processing trends over time
- **Bar Charts**: Client performance comparison
- **Pie Charts**: Status distribution breakdown
- **Line Charts**: Processing time trends

### Advanced Filtering

- Date range selection
- Client-specific filtering
- Country-based filtering
- Status filtering
- Quick preset filters (24h, 1week, 1month)

### Data Table

- Sortable columns
- Pagination
- Detailed row data
- Modal pop-ups for full log details
- Success rate progress bars

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (configure as needed)

### Performance Optimization

- **React Query** - Intelligent caching and background updates
- **Code Splitting** - Vendor chunks separated for better caching
- **Lazy Loading** - Components loaded on demand
- **Optimized Bundles** - Tree-shaking and minification

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:

- **Mobile**: 320px+ (sm)
- **Tablet**: 768px+ (md)
- **Desktop**: 1024px+ (lg)
- **Large**: 1280px+ (xl)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The built files in `dist/` can be deployed to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

### Environment Variables for Production

```bash
VITE_API_URL=https://your-production-api.com
VITE_APP_NAME="Botson AI Analyzer"
```

## 🔮 Future Enhancements

- **Real AI Integration** - Connect to OpenAI/Claude for natural language queries
- **Export Features** - PDF/Excel export of charts and data
- **Real-time Updates** - WebSocket integration for live data
- **Advanced Analytics** - Predictive analytics and forecasting
- **User Management** - Authentication and role-based access
- **Notification System** - Alerts for performance issues

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

---

Built with ❤️ for Botson.ai
