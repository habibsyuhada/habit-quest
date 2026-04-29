# HabitQuest

An offline-first, template-based habit tracker web app built with Next.js. Users can choose a life goal, start a ready-made 30-day habit template, complete daily habits, earn XP, maintain streaks, and view their progress through a beautiful life-map journey.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (custom implementation)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Local Database**: Dexie.js (IndexedDB)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Form Handling**: React Hook Form
- **PWA**: next-pwa (planned)

## Features

### Core Features
- ✅ User authentication (email/password & OAuth ready)
- ✅ Beautiful onboarding flow
- ✅ 8 pre-built habit templates
- ✅ Daily habit tracking with XP system
- ✅ Streak tracking
- ✅ Offline-first with IndexedDB
- ✅ Sync engine for online/offline data
- ✅ Life map progress visualization
- ✅ Template marketplace
- ✅ App versioning and update system
- ✅ Template versioning support

### Advanced Features
- ✅ Local database schema versioning
- ✅ Safe app shell updates (no data loss)
- ✅ Sync queue with retry logic
- ✅ Idempotent sync events
- ✅ Mobile-first responsive design
- ✅ Beautiful gamified UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd habit-quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update the following variables:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/habitquest"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXT_PUBLIC_API_VERSION=1
   MINIMUM_SUPPORTED_APP_VERSION=1.0.0
   LATEST_APP_VERSION=1.0.0
   FORCE_UPDATE=false
   
   # Optional - for Google login
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```

4. **Set up the database**
   
   Generate Prisma client:
   ```bash
   npm run db:generate
   ```

   Push the schema to your database:
   ```bash
   npm run db:push
   ```

   Seed the database with templates:
   ```bash
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Landing page
│   ├── login/               # Authentication
│   ├── onboarding/          # First-time user flow
│   ├── dashboard/           # Main habit tracking
│   ├── templates/           # Template marketplace
│   ├── progress/            # Life map and stats
│   ├── settings/            # App settings
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── layout/              # Layout components
│   ├── habit/               # Habit-related components
│   ├── template/            # Template-related components
│   ├── progress/            # Progress components
│   └── onboarding/          # Onboarding components
├── lib/                     # Utility libraries
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # NextAuth configuration
│   ├── local-db.ts          # IndexedDB setup
│   ├── sync-engine.ts       # Sync logic
│   └── ...                  # Other utilities
├── stores/                  # Zustand state stores
├── types/                   # TypeScript types
└── prisma/                  # Database schema and seeds
```

## Database Schema

The app uses PostgreSQL with the following main entities:

- **User**: User accounts and authentication
- **HabitTemplate**: Master habit templates
- **HabitTemplateItem**: Individual habits within templates
- **UserHabit**: User's active habits
- **HabitLog**: Habit completion records
- **UserProgress**: XP, level, and streak data
- **SyncEvent**: Sync event tracking

## Offline-First Architecture

### Local Database (IndexedDB)
The app uses Dexie.js to store data locally in IndexedDB:
- Templates and template items
- User habits and logs
- User progress
- Sync queue
- App metadata

### Sync Engine
The sync engine handles:
- **Push**: Uploads local changes to the server
- **Pull**: Downloads server changes
- **Retry**: Failed sync attempts are queued
- **Idempotency**: Duplicate events are handled safely

### App Versioning
The app supports safe updates:
- App shell updates don't delete local data
- Template versioning allows for safe updates
- Force update mechanism for critical changes
- Update banner for optional updates

## Deployment

### Netlify Deployment

1. **Set environment variables** in Netlify dashboard:
   ```
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=https://your-domain.com
   NEXT_PUBLIC_APP_VERSION=1.0.0
   # ... other variables
   ```

2. **Build command**:
   ```bash
   npm run build
   ```

3. **Publish directory**: `.next`

4. **Important notes**:
   - Use a connection pooler (PgBouncer) for PostgreSQL
   - Set `NEXTAUTH_URL` to your production domain
   - Generate a strong `NEXTAUTH_SECRET`

### Database Setup for Production

1. Create a PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Run seed: `npm run db:seed`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with templates
- `npm run db:studio` - Open Prisma Studio

## Template System

Templates are the core of HabitQuest. Each template includes:
- Title, description, and category
- 30-day duration
- Daily habit items
- XP rewards
- Difficulty level
- Version tracking

### Creating New Templates

Edit `prisma/seed.ts` to add new templates, then run:
```bash
npm run db:seed
```

## Sync Event Types

- `TEMPLATE_STARTED`: User starts a new template
- `HABIT_COMPLETED`: User completes a habit
- `HABIT_UNCOMPLETED`: User uncompletes a habit
- `HABIT_CREATED`: User creates a custom habit
- `HABIT_UPDATED`: User updates a habit
- `RECOVERY_TOKEN_USED`: User uses a streak recovery token

## Security

- All API inputs validated with Zod
- Server-side XP and streak calculation
- Idempotent sync events
- User data isolation
- Secure session handling

## Performance

- Mobile-first design
- Lazy loading components
- Optimistic UI updates
- Local-first behavior
- Efficient sync batching

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.

---

**Built with ❤️ using Next.js and TypeScript**
