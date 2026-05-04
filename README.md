# Habit Quest - Gamified Habit Tracking

A gamified habit tracking application inspired by Habitica, built with Next.js 14, TypeScript, and shadcn/ui. Turn your life into an RPG and level up by completing real-life tasks!

## Features

### Core Task Management
- **Habits**: Track positive and negative habits with quick actions
- **Dailies**: Recurring tasks with streak tracking
- **To-Dos**: One-time tasks to complete and check off

### RPG Gamification
- **Leveling System**: Earn XP and level up as you complete tasks
- **Health System**: Lose health for missed dailies, gain health for streaks
- **Gold Rewards**: Earn gold to spend in the shop
- **Character Stats**: Strength, Intelligence, Constitution, and Perception

### Avatar System
- **Customizable Avatar**: Choose hair style, hair color, skin tone, and shirt color
- **Visual Progress**: See your character grow as you level up

### Shop & Rewards
- **Equipment Shop**: Purchase weapons, armor, and items
- **Potions**: Health and mana restoration items
- **Custom Rewards**: Create your own personal rewards to motivate yourself

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd habit-quest
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Creating Tasks

1. Click the "Create Task" button on the Tasks page
2. Choose task type: Habit, Daily, or To-Do
3. Set title, description, and difficulty
4. Adjust reward multiplier (0.1x to 2x)
5. For habits: choose positive/negative/both
6. For dailies: select repeat days
7. Click "Create Task"

### Completing Tasks

- **Habits**: Click "Positive" (+) or "Negative" (-) buttons
- **Dailies**: Click "Complete Daily" once per day
- **To-Dos**: Click "Complete To-Do" to finish the task

### Earning Rewards

- **Easy tasks**: +5 XP, +2 Gold
- **Medium tasks**: +10 XP, +5 Gold
- **Hard tasks**: +15 XP, +10 Gold
- **Streak bonus**: +1 Health every 7 days for dailies

### Leveling Up

- XP requirements increase with each level (20% more XP per level)
- Leveling up restores health and increases max mana
- All stats increase by 1 point per level

### Shopping

1. Navigate to the Shop page
2. Browse equipment, potions, or custom rewards
3. Click "Buy" to purchase items with your gold
4. Create custom rewards for personal motivation

### Avatar Customization

1. Go to the Avatar page
2. Customize hair style, hair color, skin tone, shirt color, and background
3. Click "Save Changes" to apply

## Game Mechanics

### Health System
- Start with 50 health
- Miss a daily: -1 health
- 7+ day streak: +1 health
- Death (0 health): Lose 50% gold and 1 level

### Mana System
- Start with 10 mana (max 50)
- Regenerates +1 per day
- Reserved for future features

### Task Difficulty
- **Easy**: Basic tasks, low reward
- **Medium**: Standard tasks, balanced reward
- **Hard**: Challenging tasks, high reward

## Data Persistence

All game data is automatically saved to your browser's localStorage:
- User profile and stats
- All tasks and progress
- Purchased rewards
- Avatar customization

Your progress persists across browser sessions!

## Project Structure

```
habit-quest/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   ├── tasks/               # Task management
│   ├── shop/                # Reward shop
│   └── avatar/              # Avatar creator
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── task/                # Task-related components
│   ├── avatar/              # Avatar components
│   ├── shop/                # Shop components
│   ├── dashboard/           # Dashboard components
│   └── layout/              # Layout components
├── lib/                     # Core utilities
│   ├── store.ts            # Zustand state management
│   ├── types.ts            # TypeScript types
│   ├── constants.ts        # Game configuration
│   ├── game-mechanics.ts   # Game logic
│   └── utils.ts            # Helper functions
└── public/                  # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality React components
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations

## Future Enhancements

- Social features (parties, guilds)
- Backend sync with Supabase
- More avatar customization options
- Achievements system
- Challenge system
- Mobile app (React Native)
- Data export/import
- Theme customization (dark mode)
- More equipment and items

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by [Habitica](https://habitica.com)
- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy questing! 🎮⚔️**