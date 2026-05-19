# Shell Shock - Supabase Setup Guide

## Overview
This guide shows you how to connect Supabase to store game scores and leaderboard data.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Give it a name (e.g., "Shell Shock")
5. Set a strong password
6. Choose your region
7. Click **"Create new project"** and wait for it to complete

## Step 2: Get Your API Credentials

1. Go to **Project Settings** (bottom left)
2. Click **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the API key under "Project API keys")

## Step 3: Create Database Tables

Run this SQL in Supabase's **SQL Editor**:

```sql
-- Create game_runs table
create table if not exists game_runs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users on delete cascade,
  difficulty text not null,
  score integer not null,
  tasks_completed integer not null,
  tasks_total integer not null,
  duration_seconds integer,
  created_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists game_runs_user_id_idx on game_runs(user_id);
create index if not exists game_runs_score_idx on game_runs(score desc);
create index if not exists game_runs_difficulty_idx on game_runs(difficulty);

-- Enable RLS (Row Level Security)
alter table game_runs enable row level security;

-- Allow users to read all scores (public leaderboard)
create policy "Anyone can read game_runs" on game_runs
  for select using (true);

-- Allow authenticated users to insert their own scores
create policy "Users can insert their own game_runs" on game_runs
  for insert with check (auth.uid() = user_id);
```

## Step 4: Update Configuration

1. Open **.env** in your project
2. Fill in your Supabase credentials:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Example:
```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Then copy these values into **supabase.js**:

```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Note:** The `.env` file is in `.gitignore` so your credentials won't be committed to git.

## Step 5: Include Supabase in Your HTML

Add this to the `<head>` section of each HTML file (before `<script src="game.js"></script>`):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4"></script>
<script src="supabase.js"></script>
```

Then initialize Supabase in a script:

```html
<script>
  // Initialize Supabase when page loads
  window.addEventListener('load', async () => {
    await initSupabase();
    // Optionally auto-login anonymously
    if (!getCurrentUser()) {
      await signInAnonymously();
    }
  });
</script>
```

## Optional: Add Authentication UI

Add these functions to allow users to sign in with email:

### HTML Example (add to index.html):

```html
<div id="auth-status" style="position:absolute;top:10px;right:10px;font-size:11px;color:var(--gr);">
  <span id="user-info">Not logged in</span>
  <button id="auth-btn" class="btn btn-sm" style="margin-left:8px;display:none;">Sign In</button>
</div>

<script>
window.addEventListener('load', async () => {
  await initSupabase();
  if (!getCurrentUser()) {
    await signInAnonymously();
  }
  updateAuthStatus();
});

function updateAuthStatus() {
  const user = getCurrentUser();
  const info = document.getElementById('user-info');
  if (user) {
    info.textContent = `Logged in (${user.user_metadata?.email || 'anonymous'})`;
  }
}
</script>
```

## How It Works

1. **Automatic Sync**: When a user completes a game, the score is automatically saved to Supabase
2. **Leaderboard**: Fetch the top scores from Supabase (public API)
3. **User Stats**: Each user's best score and stats sync across devices
4. **Fallback**: If Supabase is not configured, the game uses localStorage only

## Features

### Game State (localStorage + Supabase)
- Current game state
- Leaderboard (local and cloud)
- User stats

### Database Functions Available

```javascript
// Initialize Supabase
await initSupabase()

// Authentication
await signInAnonymously()
await signUpWithEmail(email, password)
await signInWithEmail(email, password)
await signOut()

// Game Data
await saveGameRun(runData)
await fetchLeaderboard(difficulty, limit)
await fetchUserStats()

// Utilities
getCurrentUser()
isSupabaseEnabled()
```

## Troubleshooting

### "Supabase not configured. Using localStorage only."
- You haven't set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `supabase.js`

### Scores not saving to Supabase
- Make sure you called `await initSupabase()` before playing
- Check that you're logged in (`getCurrentUser()` returns a user)
- Check browser console for errors

### Leaderboard not updating
- Refresh the page to fetch the latest scores
- Make sure you completed a game and were logged in

## Security Notes

- The `anon` key is safe to expose in frontend code
- Row Level Security (RLS) policies ensure users can only see public data
- Users can only insert scores under their own user_id

## Next Steps

- Add email/password authentication UI
- Add player profiles
- Track game duration and accuracy stats
- Add seasonal leaderboards
- Send emails for achievements
