# Math Bank Backend API

Backend API for Math Bank (بنك الرياضيات) educational platform.

## Tech Stack

- **Express.js** + **TypeScript**
- **Prisma ORM** + **MySQL**
- **JWT** authentication
- **Nodemailer** for email verification
- **Zod** for validation

## Architecture

Layered architecture following the pattern:
```
Routes → Controllers → Services → Repositories → Prisma → MySQL
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Production

Start production server:
```bash
npm start
```

## Database

View database in Prisma Studio:
```bash
npm run prisma:studio
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   ├── modules/               # Feature modules (auth, user, quiz, etc.)
│   ├── services/              # Shared services
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
└── package.json
```

## API Documentation

API endpoints will be documented as modules are implemented.

Base URL: `http://localhost:4000/api/v1`

Health check: `GET /api/health`
