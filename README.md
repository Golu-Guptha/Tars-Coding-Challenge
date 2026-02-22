# Tars Chat

Hey! This is my submission for the Tars Full-Stack Intern Challenge 2026.

I'm building a real-time chat app where users can sign up, find each other, and start chatting instantly, step by step. Below is what's working right now.

## What's working so far

### Step 1 — Authentication
- Sign up and log in with email or Google (via Clerk)
- User profiles automatically sync to the Convex database
- Logged-in user's name and avatar shown in the header
- Protected routes — unauthenticated users get redirected to sign-in

### Step 2 — User List & Search
- Browse all registered users (you won't see yourself in the list)
- Search bar that filters users by name as you type
- Click any user to start a conversation with them

### Step 3 — Direct Messages
- Send and receive messages in real time using Convex subscriptions
- Messages appear instantly on both sides without refreshing
- Your messages show on the right (purple), received messages on the left (gray)
- Sidebar shows all your conversations with a preview of the last message

### Step 4 — Smart Timestamps
- Today's messages show time only (e.g. "2:34 PM")
- Older messages show date + time (e.g. "Feb 15, 2:34 PM")
- Messages from a different year include the year
- Timestamps appear on hover to keep the UI clean

## Tech I used

- **Next.js** with App Router & TypeScript
- **Convex** for the backend and real-time database
- **Clerk** for authentication
- **Tailwind CSS** + **shadcn/ui** for styling
- Deployed on **Vercel**

## Running locally

You'll need Node 18+ and free accounts on [Clerk](https://clerk.com) and [Convex](https://convex.dev).

```bash
git clone https://github.com/Golu-Guptha/Tars-Coding-Challenge.git
cd Tars-Coding-Challenge
npm install
cp .env.example .env.local
# fill in your Clerk + Convex keys in .env.local
```

Then run two terminals:

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

Open [localhost:3000](http://localhost:3000) and you're good to go.

## Project structure

```
app/            → pages and layouts (App Router)
components/     → reusable UI components
convex/         → backend functions, schema, auth config
lib/            → utility functions (timestamps, etc.)
```

---

Built by [Golu Kumar Gupta](https://github.com/Golu-Guptha)
