# 🚀 FlaxH Trade - Solana Token Transfer Platform

A modern, secure, and user-friendly frontend for transferring SOL tokens on the Solana blockchain. Built with Next.js 15, TypeScript, and seamlessly integrated with our NestJS backend infrastructure.

## ✨ Features

- 🔐 **Secure Wallet Integration** - Connect with Phantom wallet
- 💸 **SOL Token Transfers** - Send SOL to any Solana address
- 📊 **Real-time Balance** - Live SOL balance updates
- 🎨 **Modern UI** - Beautiful interface with shadcn/ui components
- 🌙 **Dark/Light Theme** - System preference or manual toggle
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast Performance** - Built with Next.js 15 and React Query
- 🔒 **Backend Integration** - All blockchain operations handled securely

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Wallet Integration**: Phantom Wallet
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + Prettier

## 🏗️ Architecture

```
Frontend (This Repo)           Backend (flaxh-trade-api)
├─ UI/UX Components       ←→   ├─ Solana Operations
├─ Wallet Connection           ├─ Transaction Processing
├─ Form Validation             ├─ Balance Queries
├─ API Communication           ├─ Security & Validation
└─ State Management            └─ Audit & Logging
```

### 📁 Project Structure

```
flaxh-trade-ui/
├─ app/                     # Next.js App Router
│  ├─ layout.tsx           # Root layout with providers
│  ├─ page.tsx             # Landing page
│  └─ dashboard/           # Dashboard and transfer pages
├─ components/             # Reusable UI components
│  └─ ui/                  # shadcn/ui components
├─ features/               # Feature-based modules
│  ├─ wallets/            # Wallet connection & management
│  └─ transfers/          # SOL transfer functionality
├─ lib/                    # Core utilities
│  ├─ api-client.ts       # Backend API client
│  ├─ wallet.ts           # Phantom wallet integration
│  └─ validators.ts       # Form validation schemas
├─ providers/              # React context providers
├─ types/                  # TypeScript type definitions
└─ tests/                  # Unit and E2E tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Phantom Wallet browser extension
- Running [flaxh-trade-api](../flaxh-trade-api) backend

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flaxh-trade-ui

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Development
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

## 🎯 Usage

### 1. **Landing Page** (`/`)
- Marketing page with features overview
- Call-to-action buttons to get started

### 2. **Dashboard** (`/dashboard`)
- Overview of available features
- Navigation to transfer functionality

### 3. **Transfer Page** (`/dashboard/transfer`)
- Connect Phantom wallet
- View SOL balance
- Send SOL to recipient address
- Add optional memo

### Wallet Connection Flow

1. Click "Connect Phantom Wallet"
2. Authorize connection in Phantom popup
3. View connected wallet address and balance
4. Start making transfers

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## 🛠️ Development

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Code formatting
pnpm format
pnpm format:check

# Build for production
pnpm build
pnpm start
```

## 🔗 API Integration

This frontend integrates with the [flaxh-trade-api](../flaxh-trade-api) NestJS backend for:

- **Authentication**: JWT-based user authentication
- **Wallet Management**: Wallet registration and balance queries
- **Transactions**: SOL transfer creation and status tracking
- **Security**: All blockchain operations handled server-side

### API Endpoints Used

```typescript
// Wallet operations
POST /wallets/connect     # Register wallet
GET  /wallets/{address}/balance  # Get balance

// Transactions
POST /transactions        # Create transfer
GET  /transactions/{id}   # Get status
GET  /transactions/history/{address}  # Get history

// Authentication
POST /auth/login         # User login
POST /auth/register      # User registration
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Or use Vercel GitHub integration
```

### Docker

```bash
# Build Docker image
docker build -t flaxh-trade-ui .

# Run container
docker run -p 3000:3000 flaxh-trade-ui
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance tasks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Solana](https://solana.com) for the fast blockchain infrastructure
- [Phantom](https://phantom.app) for seamless wallet integration

## 📞 Support

For support and questions:

- Open an [issue](../../issues)
- Check the [documentation](docs/)
- Contact the development team

---

**Built with ❤️ for the Solana ecosystem**
