# NeuraSlide Backend

Instagram automation platform backend built with Express.js, TypeScript, and MongoDB.

## Features

- 🔐 Authentication & Authorization
- 📱 Instagram OAuth Integration
- 🤖 Automation Engine
- 💬 Message Management
- 📊 Analytics & Metrics
- 🔄 Webhook Processing
- 🤖 AI Autopilot Support

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT
- **Queue**: BullMQ + Redis (planned)
- **AI**: OpenAI Integration (planned)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (for job queue)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment setup**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Instagram Integration

- `GET /api/instagram/oauth-url` - Get OAuth URL
- `GET /api/instagram/callback` - OAuth callback
- `GET /api/instagram/accounts` - List connected accounts

### Automations

- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `GET /api/automations/:id` - Get automation details
- `PATCH /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation

### Webhooks

- `POST /api/webhooks/instagram` - Instagram webhook receiver

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Data models (Prisma)
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── index.ts         # Main application file
```

## Environment Variables

See `env.example` for all required environment variables.

## Development

### Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **Users** - Application users
- **Teams** - Organization/team management
- **InstagramAccounts** - Connected Instagram accounts
- **Automations** - Automation rules and triggers
- **Conversations** - Message conversations
- **Messages** - Individual messages
- **JobLogs** - Background job tracking

### Adding New Features

1. Update Prisma schema if needed
2. Create controllers and services
3. Add routes
4. Update TypeScript types
5. Add tests (planned)

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker (planned)

```bash
docker build -t neuraslide-backend .
docker run -p 5000:5000 neuraslide-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC
