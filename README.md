# 💉 Peptide Tracker

A full-stack application for tracking peptide protocols, cycles, and dosage logs.

## 🗂️ Structure

```
peptide-tracker/
├── apps/
│   ├── api/        # REST API (Fastify + Prisma + PostgreSQL)
│   └── mobile/     # Mobile app (React Native + Expo + NativeWind)
```

## 🚀 Tech Stack

### Backend (`apps/api`)
- **[Fastify](https://fastify.dev/)** — Web framework
- **[Prisma](https://www.prisma.io/)** — ORM
- **[PostgreSQL](https://www.postgresql.org/)** — Database (via Supabase)
- **[Zod](https://zod.dev/)** — Schema validation
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Password hashing
- **TypeScript**

### Mobile (`apps/mobile`)
- **[React Native](https://reactnative.dev/)** + **[Expo](https://expo.dev/)** (SDK 55)
- **[Expo Router](https://expo.github.io/router/)** — File-based navigation
- **[NativeWind](https://www.nativewind.dev/)** — Tailwind CSS for React Native
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** — Animations
- **TypeScript**

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase project)

### API

```bash
cd apps/api
npm install
cp .env.example .env   # fill in DATABASE_URL and DIRECT_URL
npx prisma migrate dev
npm run dev
```

### Mobile

```bash
cd apps/mobile/app
npm install
npx expo start
```

## 📦 Database Models

| Model | Description |
|---|---|
| `User` | Authenticated user |
| `Protocol` | Peptide protocol (name, dosage, frequency, route) |
| `ProtocolLog` | Individual dosage log entry |

## 📄 License

MIT
