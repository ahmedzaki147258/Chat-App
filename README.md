# Chat App Monorepo

A full-stack monorepo built with PNPM workspaces, featuring a NextJS frontend, Express TypeScript backend, and shared packages for types and utilities.

## 🏗️ Project Structure

```
chat-app/
├── bruno/               # Bruno collection for API testing
├── packages/
│   ├── backend/         # Express TypeScript API server
│   └── frontend/        # NextJS React application
├── shared/
│   ├── types/           # Shared TypeScript interfaces
│   └── utils/           # Shared utility functions
├── package.json         # Root package configuration
├── pnpm-workspace.yaml  # PNPM workspace configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PNPM package manager

```bash
npm install -g pnpm
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chat-app
   ```

2. **Install all dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp packages/backend/.env.example packages/backend/.env
   
   # Edit the .env file with your configuration
   nano packages/backend/.env
   ```

4. **Create .env.local for frontend**
   ```bash
   # create the environment file
   touch packages/frontend/.env.local
   
   # Edit the .env.local file with your configuration
   nano packages/frontend/.env.local
   ```

## 🎯 Running the Project

### Development Mode

#### Start both frontend and backend simultaneously:
```bash
pnpm dev
```

#### Or start them individually:

**Backend only** (Express API server):
```bash
pnpm start:backend
# Runs on http://localhost:4000
```

**Frontend only** (NextJS app):
```bash
pnpm start:frontend
# Runs on http://localhost:3000
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm build` | Build all packages for production |
| `pnpm start:backend` | Start only backend with nodemon |
| `pnpm start:frontend` | Start only frontend with NextJS dev server |

## 🔗 API Endpoints

Once the backend is running, you can test these endpoints:

- **App Check**: `GET http://localhost:4000`

### Example API Usage

```bash
# App check
curl http://localhost:4000
```

## 📁 Package Details

### Backend (`packages/backend`)
- **Framework**: Express.js with TypeScript
- **Development**: Nodemon for hot reload
- **Port**: 400 (configurable via `.env`)

### Frontend (`packages/frontend`)
- **Framework**: NextJS 14 with App Router
- **Styling**: Tailwind CSS - Daisy UI with Multi themes
- **Port**: 3000

<!-- ### Shared Packages

#### `shared/types`
Contains shared TypeScript interfaces:
- `User` - User data structure
- `ApiResponse` - Standard API response format
- `PaginatedResponse` - Paginated API responses

#### `shared/utils`
Contains shared utility functions:
- `addNumbers()` - Add two numbers
- `addMultiple()` - Add multiple numbers
- `formatDate()` - Format dates
- `formatCurrency()` - Format currency
- `isValidEmail()` - Email validation
- `isNotEmpty()` - String validation -->


<!-- ## 🔧 Using Shared Packages

Import shared types and utilities using path aliases:

```typescript
// In backend or frontend
import { addNumbers } from '@/shared/utils/add';
import { User } from '@/shared/types/user';
import { formatDate } from '@/shared/utils/format';

// Example usage
const sum = addNumbers(5, 3);
const currentTime = formatDate(new Date());
``` -->

## 🛠️ Development Tips

### Adding New Shared Functions

1. Create new functions in `shared/utils/src/`
2. Export them from `shared/utils/src/index.ts`
3. Import them in your frontend/backend using the path alias

### Adding New Types

1. Create new interfaces in `shared/types/src/`
2. Export them from `shared/types/src/index.ts`
3. Import them using the path alias

### Package Management

```bash
# Install package in specific workspace
pnpm --filter backend add express
pnpm --filter frontend add axios

# Install dev dependency
pnpm --filter backend add -D nodemon

# Install package in root
pnpm add -w typescript
```

## 🔍 Troubleshooting

### TypeScript Path Resolution Issues

If you get import errors, make sure:
1. The `tsconfig.json` paths are correctly configured
2. You've installed `tsconfig-paths` in backend
3. The shared packages are properly structured

### PNPM Issues

If PNPM workspace linking isn't working:
```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules shared/*/node_modules
pnpm install
```

## 📝 Environment Variables


### Frontend Environment Variables

Create `packages/frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend Environment Variables

Create `packages/backend/.env` with:

```env
PORT=4000
NODE_ENV=development

# JWT Configuration
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# Database Configuration
DB_NAME=chat_app
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_HOST=localhost
DB_DIALECT=mysql

# Cloudinary Configuration
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

# Google OAuth Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Application URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:4000
```