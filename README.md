# CodePath Frontend

AI-Powered Competitive Programming Platform - Frontend Application

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Code Editor**: Monaco Editor
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── problems/          # Problem pages
│   ├── contests/          # Contest pages
│   └── admin/             # Admin pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── editor/           # Monaco Editor component
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api-client.ts    # Axios configuration
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
```

## Features

- ✅ Authentication (Login/Register)
- ✅ Dashboard with CodePrint placeholder
- ✅ Monaco Editor integration
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ API client with JWT token management
- ✅ Protected routes

## Next Steps

1. Connect to backend API endpoints
2. Implement CodePrint Dashboard with charts
3. Build Problem solving page with Monaco Editor
4. Add AI Chat component
5. Implement Virtual Contest features
6. Add Learning Paths module
7. Set up WebSocket for real-time features

## Environment Variables

See `.env.example` for required environment variables.

## License

Private - CodePath Project
