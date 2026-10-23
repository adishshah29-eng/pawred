# Pawred demo guide

Everything below uses made-up sample data. The health documents are sample images, not real records.

## 1. Get ready (once)

```bash
npm run db:seed      # ~1 minute: 41 dogs, 7 matches, chats, queues, 3 demo accounts
npm run dev
```

Open <http://localhost:3000/sign-in>. With `DEMO_MODE="true"` in `.env` you will see a **Demo mode** panel with one-click buttons.
The shared password is `DEMO_PASSWORD` in `.env`. You never have to type it.

| Account | Role | What it has ready |
|---|---|---|
| **Priya Nair** (`priya@pawred.demo`) | Owner of **Luna**, female Golden Retriever, Pune | An unread chat from Simba. **Cooper** is first in her Discover. |
| **Rohan Mehta** (`rohan@pawred.demo`) | Owner of **Cooper**, male Golden Retriever, Pune | **Honey** already liked him. Unread message from Sunny. |
| **Pawred Admin** (`admin@pawred.demo`) | Admin | 7 documents waiting, 2 open reports. |

## 2. Two people at once

Cookies are shared by every tab in one browser, so use **two windows**:

- Window 1: a normal window, signed in as **Priya**.
- Window 2: a **private/incognito window** (or a second browser), signed in as **Rohan**.

Put them side by side. When Priya sends a like or a message, Rohan's window shows it within a few seconds.

## 3. Suggested 6-minute walkthrough

1. **Landing page.** Read the headline, try the sample profile on the right (like a photo, add a comment, see the match screen).
2. **Priya → Discover.** It opens as an Instagram-style **Feed**: Cooper is first, with swipeable photos, health chips and "why Cooper fits Luna". Switch to **Grid** (top left) for the Pinterest-style masonry of all 19 compatible dogs. Point out that a like is on a *specific* photo or answer (heart button, or double-click a photo).
3. **Priya likes Cooper's photo** with a comment such as "Luna loves the lake too." A "Like sent" message appears.
4. **Rohan → Likes you** (badge shows it). He sees *what* was liked and the comment, plus Honey's earlier like. **Like back on Priya.**
5. **It's a match.** Both land in the chat. Send a message each way and show it arriving in the other window, then "Read" appearing.
6. **Priya → Matches.** The unread chat from Simba, and the unread badge in the nav.
7. **Admin window → Verifications.** Open a sample document, approve it, and show the dog get its Verified badge.
8. **Admin → Reports and Users.** Pause a reported dog, ban and unban an owner. Every action appears on the Overview activity feed.

## 4. Reset between demos

```bash
npm run demo:reset   # a few seconds: only the demo accounts' likes, matches and chats
npm run db:seed      # full reset of all sample data (about a minute)
```

`demo:reset` puts Luna and Cooper back to "not matched yet", so the walkthrough works again.

## 5. Before the real launch

- Set `DEMO_MODE="false"` (and remove it on Vercel). Then the demo buttons disappear from the sign-in page.
- The demo accounts and sample dogs stay in the database until you delete them. To remove them all: in Supabase, delete users whose id starts with `seed-` or `demo-` (this cascades to their dogs, chats and likes).

## 6. If something looks off

- **Demo buttons missing:** `DEMO_MODE` isn't `"true"` in `.env`, or the dev server needs a restart.
- **"Couldn't sign in":** run `npm run db:seed` to recreate the accounts.
- **Photo uploads fail:** add `SUPABASE_SERVICE_ROLE_KEY` to `.env`. The mock data itself doesn't need it.
- **Seed says it couldn't fetch photos:** it downloads sample dog photos from dog.ceo, so it needs internet. Run it again.
