// Supabase Configuration

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
let supabaseClient = null;
let currentUser = null;

// Initialize Supabase Client
async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase not configured. Using localStorage only.');
    return false;
  }
  
  try {
    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check for existing session
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase initialization failed:', error);
    return false;
  }
}

// Sign up / Login anonymously or with email
async function signInAnonymously() {
  if (!supabaseClient) return null;
  
  try {
    const { data, error } = await supabaseClient.auth.signInAnonymously();
    if (error) throw error;
    currentUser = data.user;
    return data.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    return null;
  }
}

// Sign up with email
async function signUpWithEmail(email, password, username) {
  if (!supabaseClient) return null;
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    if (error) throw error;
    currentUser = data.user;
    return data.user;
  } catch (error) {
    console.error('Sign up failed:', error);
    return null;
  }
}

// Sign in with email
async function signInWithEmail(email, password) {
  if (!supabaseClient) return null;
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    currentUser = data.user;
    return data.user;
  } catch (error) {
    console.error('Sign in failed:', error);
    return null;
  }
}

// Sign out
async function signOut() {
  if (!supabaseClient) return;
  
  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

// Save game run to Supabase
async function saveGameRun(runData) {
  if (!supabaseClient || !currentUser) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from('game_runs')
      .insert([
        {
          user_id: currentUser.id,
          username: currentUser.user_metadata?.username || (currentUser.email ? currentUser.email.split('@')[0] : 'Guest'),
          difficulty: runData.difficulty,
          score: runData.score,
          tasks_completed: runData.tasksCompleted,
          tasks_total: runData.tasksTotal,
          duration_seconds: runData.durationSeconds,
          created_at: new Date().toISOString(),
        },
      ])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Failed to save game run:', error);
    return null;
  }
}

// Fetch leaderboard from Supabase
async function fetchLeaderboard(difficulty = null, limit = 10) {
  if (!supabaseClient) return [];
  
  try {
    let query = supabaseClient
      .from('game_runs')
      .select('id, user_id, username, difficulty, score, tasks_completed, tasks_total, created_at')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

// Fetch user's stats
async function fetchUserStats() {
  if (!supabaseClient || !currentUser) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from('game_runs')
      .select('score, tasks_completed, difficulty')
      .eq('user_id', currentUser.id);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { best: null, runs: 0, totalTasks: 0 };
    }
    
    return {
      best: Math.max(...data.map(d => d.score)),
      runs: data.length,
      totalTasks: data.reduce((sum, d) => sum + d.tasks_completed, 0),
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return null;
  }
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Check if Supabase is available
function isSupabaseEnabled() {
  return supabaseClient !== null;
}

// Expose functions globally since Vite modules have local scope
window.initSupabase = initSupabase;
window.signInAnonymously = signInAnonymously;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.saveGameRun = saveGameRun;
window.fetchLeaderboard = fetchLeaderboard;
window.fetchUserStats = fetchUserStats;
window.getCurrentUser = getCurrentUser;
window.isSupabaseEnabled = isSupabaseEnabled;
