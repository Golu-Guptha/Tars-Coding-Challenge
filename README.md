# Tars Chat

A real-time chat app built for the **Tars Full-Stack Intern Challenge 2026**.

Users can sign up, find each other, and have private conversations — all with instant real-time sync.

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Convex** — real-time backend & database
- **Clerk** — authentication (email + Google)
- **Tailwind CSS** + **shadcn/ui**

## What's Working Right Now

### ✅ Step 1 — Authentication
- Sign up and log in with email or Google (via Clerk)
- Protected routes — unauthenticated users get redirected to sign-in
- User profiles automatically synced to Convex database on first login
- Logged-in user's name and avatar shown in the header
- Sign out via the user menu

### ✅ Step 2 — User List & Search
- Sidebar shows all your conversations
- Click the **+** button to browse all registered users
- Search bar filters users by name as you type
- Clicking a user creates a conversation (or opens existing one)
- Empty states when there are no conversations or no users found

### ✅ Step 3 — One-on-One Direct Messages
- Send and receive messages in real time (Convex subscriptions)
- Messages appear instantly in both tabs — no refresh needed
- Your messages are purple (right side), received messages are gray (left side)
- Sidebar updates with the latest message preview
- Empty state shown when a conversation has no messages yet

### ✅ Step 4 — Smart Timestamps
- Today's messages show time only: `2:34 PM`
- Older messages show date + time: `Feb 15, 2:34 PM`
- Messages from a different year include the year: `Feb 15, 2025, 2:34 PM`
- Timestamps appear on hover to keep the UI clean

## Running Locally

Need Node 18+ and free accounts on [Clerk](https://clerk.com) and [Convex](https://convex.dev).

```bash
git clone https://github.com/Golu-Guptha/Tars-Coding-Challenge.git
cd Tars-Coding-Challenge
npm install
cp .env.example .env.local
# fill in your Clerk + Convex keys in .env.local
```

Run two terminals:
```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
app/            → pages and layouts (App Router)
components/     → reusable UI components
convex/         → backend functions, schema, auth config
lib/            → utility functions
```

---

Built by [Golu Kumar Gupta](https://github.com/Golu-Guptha)
