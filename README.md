# Tars Chat

A real-time chat application built with **Next.js**, **Convex**, **Clerk**, and **shadcn/ui**.

## Features

- ✅ Authentication (email + social login via Clerk)
- ✅ User profiles synced to Convex
- 🔜 User list & search
- 🔜 One-on-one direct messages
- 🔜 Message timestamps
- 🔜 Empty states
- 🔜 Responsive layout
- 🔜 Online/offline status
- 🔜 Typing indicator
- 🔜 Unread message count
- 🔜 Smart auto-scroll

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account ([clerk.com](https://clerk.com))
- Convex account ([convex.dev](https://convex.dev))

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/Golu-Guptha/Tars-Coding-Challenge.git
   cd Tars-Coding-Challenge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. Start Convex dev server:
   ```bash
   npx convex dev
   ```

5. In another terminal, start the Next.js dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Convex** (real-time backend + database)
- **Clerk** (authentication)
- **Tailwind CSS v4** + **shadcn/ui**
