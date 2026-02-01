# 🔥 Markly - Habit Tracking with Beautiful Heatmaps

A production-ready, mobile-first habit tracking application with GitHub-style heatmap visualizations. Built with Next.js 14, Firebase, and shadcn/ui.

![Markly Preview](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.12-orange?style=flat-square&logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### Core Functionality

- 🔐 **Google Authentication** - Secure sign-in with Firebase Auth
- 📊 **Heatmap Calendar** - GitHub-style 52-week visualization
- 🎨 **Customizable Trackers** - 8 colors × 3 shapes = 24 combinations
- 📈 **Smart Statistics** - Streaks, totals, and monthly summaries
- 🌓 **Dark/Light Mode** - System preference + manual toggle
- 📱 **Mobile-First Design** - Optimized for all screen sizes

### User Experience

- ⚡ **Instant Feedback** - Smooth animations and micro-interactions
- 💾 **Auto-Save** - Real-time sync with Firestore
- 🎯 **Empty States** - Helpful guidance for new users
- 🔔 **Toast Notifications** - Non-intrusive success/error messages
- 🎭 **Loading States** - Skeleton screens prevent layout shift
- ♿ **Accessible** - Keyboard navigation and ARIA labels

### Technical Excellence

- 🏗️ **Service Layer Architecture** - Separation of concerns
- 🎣 **Custom Hooks** - Reusable Firebase operations
- 🔒 **Type-Safe** - Comprehensive TypeScript coverage
- 🚀 **Optimized Performance** - Code splitting and lazy loading
- 📦 **Production-Ready** - Error handling and edge cases covered

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
npx create-next-app@latest markly --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd markly
npm install firebase framer-motion date-fns zustand next-themes
npx shadcn@latest init -d
npx shadcn@latest add button card dialog dropdown-menu input label toast avatar skeleton switch badge alert-dialog
```

### 2. Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Auth
3. Create Firestore database
4. Copy config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Copy Project Files

Copy all files from this repository maintaining the folder structure.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000/)

---

## 📁 Project Structure

```
markly/
├── app/
│   ├── (auth)/              # Public routes
│   │   └── login/
│   ├── (protected)/         # Authenticated routes
│   │   ├── dashboard/
│   │   ├── trackers/
│   │   │   └── [id]/
│   │   └── settings/
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/              # Header, navigation
│   ├── trackers/            # Tracker management
│   ├── heatmap/             # Heatmap visualization
│   ├── stats/               # Statistics display
│   └── auth/                # Authentication
│
├── hooks/
│   ├── use-auth.ts          # Authentication state
│   ├── use-trackers.ts      # Tracker CRUD
│   ├── use-entries.ts       # Entry management
│   ├── use-stats.ts         # Statistics calculation
│   └── use-heatmap-data.ts  # Heatmap transformation
│
├── services/
│   ├── tracker.service.ts   # Tracker business logic
│   ├── entry.service.ts     # Entry business logic
│   └── stats.service.ts     # Stats calculations
│
├── lib/
│   ├── firebase/            # Firebase config & helpers
│   ├── types.ts             # TypeScript definitions
│   ├── constants.ts         # App constants
│   └── utils.ts             # Utilities
│
└── firestore.rules          # Security rules
```

---

## 🎨 Design System

### Typography

- **UI** : DM Sans - Modern, readable sans-serif
- **Data** : JetBrains Mono - Monospace for stats

### Colors

8 vibrant tracker colors:

- 🟢 Emerald
- 🔵 Sky
- 🟣 Violet
- 🔴 Rose
- 🟡 Amber
- 🟣 Fuchsia
- 🔵 Cyan
- 🟠 Orange

### Shapes

- ▪ Square (clean, traditional)
- ● Circle (soft, friendly)
- ◆ Diamond (unique, dynamic)

### Animations

- Page transitions: 200-300ms
- Hover effects: Scale 1.05
- Staggered lists: 50ms delay
- Spring physics for modals

---

## 🔒 Security

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Best Practices

✅ Environment variables for secrets

✅ User-scoped data access

✅ Client-side auth guards

✅ Type-safe database operations

✅ Input validation

---

## 📊 Key Algorithms

### Streak Calculation

```typescript
// Current streak: consecutive days from today backward
function calculateCurrentStreak(entries: Entry[]): number {
  const today = new Date();
  let streak = 0;
  let currentDate = today;

  while (hasEntry(currentDate, entries)) {
    streak++;
    currentDate = subtractDays(currentDate, 1);
  }

  return streak;
}
```

### Heatmap Generation

```typescript
// Generate 52 weeks × 7 days grid
function generateHeatmap(entries: Entry[]): HeatmapWeek[] {
  const weeks = 52;
  const startDate = subtractWeeks(today, weeks - 1);

  return Array.from({ length: weeks }, (_, weekIndex) => ({
    days: Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(startDate, weekIndex * 7 + dayIndex);
      return {
        date: formatDate(date),
        isMarked: hasEntry(date, entries),
      };
    }),
  }));
}
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

### Environment Variables

Add all `NEXT_PUBLIC_*` variables in your hosting dashboard.

---

## 📈 Performance

### Optimizations Implemented

- ✅ Server Components for static content
- ✅ Dynamic imports for code splitting
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)
- ✅ Tailwind CSS (no runtime)
- ✅ Efficient Firestore queries

### Lighthouse Scores (Target)

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign in/out flow
- [ ] Create/edit/delete tracker
- [ ] Mark/unmark days on heatmap
- [ ] Streak calculations
- [ ] Theme switching
- [ ] Mobile responsiveness
- [ ] Error states
- [ ] Loading states

---

## 🎯 Roadmap

### Phase 1 (Current) ✅

- [x] Core habit tracking
- [x] Heatmap visualization
- [x] Statistics dashboard
- [x] Dark/light mode
- [x] Mobile-responsive

### Phase 2 (Next)

- [ ] Data export (CSV/JSON)
- [ ] Tracker categories
- [ ] Day notes/reflections
- [ ] Weekly reports
- [ ] Email reminders

### Phase 3 (Future)

- [ ] Collaboration features
- [ ] Achievement badges
- [ ] Social sharing
- [ ] API integrations
- [ ] Advanced analytics

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

## 📞 Support

- 📧 Email: support@markly.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/markly/issues)
- 📖 Docs: [Full Documentation](https://claude.ai/chat/SETUP_GUIDE.md)

---

**Made with ❤️ and ☕ for habit tracking enthusiasts**
