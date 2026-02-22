# Tars Chat

Hey! This is my submission for the Tars Full-Stack Intern Challenge 2026.

I built a real-time chat app where users can sign up, find each other, and start chatting instantly. The messages sync across tabs/devices in real time — no refreshing needed.

## What it does

- **Sign up & log in** with email or Google (powered by Clerk)
- **Find people** — browse all registered users, search by name
- **Direct messages** — click on someone to start a private conversation
- **Real-time everything** — messages, presence, typing indicators all update live
- **Smart timestamps** — shows "2:34 PM" for today, "Feb 15, 2:34 PM" for older messages
- **Unread badges** — see how many messages you missed at a glance
- **Typing indicators** — see when someone is typing back
- **Online status** — green dot shows who's currently active
- **Mobile friendly** — full responsive layout, works great on phones
- **Auto-scroll** — stays at the bottom for new messages, but won't interrupt if you're reading older ones

## Tech I used

- **Next.js** with App Router & TypeScript for the frontend
- **Convex** as the backend — handles the database and real-time subscriptions
- **Clerk** for all the auth stuff (sign-up, log-in, session management)
- **Tailwind CSS** + **shadcn/ui** for the UI components
- Deployed on **Vercel**

## Running it locally

You'll need Node 18+ and accounts on [Clerk](https://clerk.com) and [Convex](https://convex.dev) (both free).

```bash
# clone it
git clone https://github.com/Golu-Guptha/Tars-Coding-Challenge.git
cd Tars-Coding-Challenge

# install deps
npm install

# set up your env vars
cp .env.example .env.local
# then fill in your Clerk + Convex keys in .env.local
```

You need two terminals running:

```bash
# Terminal 1 — start Convex
npx convex dev

# Terminal 2 — start Next.js
npm run dev
```

Then open [localhost:3000](http://localhost:3000) and you're good to go.

## Project structure

Nothing fancy, pretty standard Next.js layout:

```
app/            → pages and layouts (App Router)
components/     → reusable UI components
convex/         → backend functions, schema, auth config
lib/            → utility functions (timestamp formatting, etc.)
```

## How it works (briefly)

Convex handles all the data and real-time sync. When you send a message, it goes through a Convex mutation, gets stored in the database, and automatically pushes to every connected client that's subscribed to that conversation. No polling, no WebSocket boilerplate — Convex does it all out of the box.

Clerk handles authentication and gives us JWTs that Convex uses to verify who's making each request. So every query and mutation is authenticated server-side.

---

Built by [Golu Kumar Gupta](https://github.com/Golu-Guptha) for the Tars Internship Challenge 2026.
