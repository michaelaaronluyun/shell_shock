const TASKS={
  easy:[
    {title:"Print working directory",desc:"Show the current working directory path.",hint:"hint: a command literally named for this",check:c=>c.trim()==='pwd',sim:'/home/user/projects',diff:'easy',time:15,pts:100},
    {title:"List files",desc:"List files in the current directory.",hint:"hint: two letters",check:c=>/^ls(\s.*)?$/.test(c.trim()),sim:'file1.txt  notes.md  src/',diff:'easy',time:15,pts:100},
    {title:"Who am I?",desc:"Print the current logged-in username.",hint:"hint: ask the shell who you are",check:c=>c.trim()==='whoami',sim:'user',diff:'easy',time:15,pts:100},
    {title:"Clear the terminal",desc:"Clear all output from the terminal screen.",hint:"hint: five letters, starts with c",check:c=>c.trim()==='clear',sim:null,diff:'easy',time:12,pts:100},
    {title:"Show date & time",desc:"Display the current date and time.",hint:"hint: four letters",check:c=>c.trim()==='date',sim:'Tue Oct 15 14:32:05 PST 2024',diff:'easy',time:15,pts:100},
    {title:"Echo a string",desc:"Echo the string: hello world",hint:"hint: echo <text>",check:c=>c.trim().toLowerCase()==='echo hello world',sim:'hello world',diff:'easy',time:18,pts:100},
    {title:"Show disk usage",desc:"Show disk usage in human-readable format.",hint:"hint: df -h or du -h .",check:c=>/^(du|df)\s+-h/.test(c.trim()),sim:'Filesystem  Size  Used Avail Use%\n/dev/sda1    20G  8.1G   11G  43%',diff:'easy',time:20,pts:120},
  ],
  normal:[
    {title:"Count lines in a file",desc:"Count the number of lines in 'data.log'.",hint:"hint: wc with a flag, targeting data.log",check:c=>/^wc\s+-l\s+data\.log$/.test(c.trim()),sim:'   1337 data.log',diff:'medium',time:25,pts:200},
    {title:"Find large files",desc:"Find all .txt files larger than 1MB in current dir.",hint:"hint: find . -name '*.txt' -size +1M",check:c=>/^find\s+\..*-name.*\*\.txt.*-size\s+\+1[Mm]/.test(c)||/^find\s+\..*-size\s+\+1[Mm].*-name.*txt/.test(c),sim:'./reports/huge.txt\n./logs/access.txt',diff:'medium',time:30,pts:200},
    {title:"Search in files",desc:"Find all lines containing 'ERROR' in 'app.log'.",hint:"hint: grep 'PATTERN' file",check:c=>/^grep\s+['"]?ERROR['"]?\s+app\.log$/.test(c.trim()),sim:'[ERROR] Connection refused at line 42\n[ERROR] Timeout at line 99',diff:'medium',time:25,pts:200},
    {title:"Sort & deduplicate",desc:"Sort 'names.txt' and remove duplicate lines.",hint:"hint: sort with a unique flag",check:c=>/^sort\s+-u\s+names\.txt$/.test(c.trim()),sim:'Alice\nBob\nCharlie\nDave',diff:'medium',time:25,pts:200},
    {title:"Show first 5 lines",desc:"Show only the first 5 lines of 'readme.txt'.",hint:"hint: head with a number flag",check:c=>/^head\s+(-n\s*5|-5)\s+readme\.txt$/.test(c.trim()),sim:'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',diff:'medium',time:20,pts:200},
    {title:"Rename a file",desc:"Rename 'old.txt' to 'new.txt'.",hint:"hint: mv source dest",check:c=>c.trim()==='mv old.txt new.txt',sim:'',diff:'medium',time:20,pts:200},
    {title:"Process count",desc:"Count how many processes are currently running.",hint:"hint: ps aux | wc -l",check:c=>/^ps\s+aux\s*\|\s*wc\s+-l$/.test(c.trim()),sim:'   142',diff:'medium',time:28,pts:220},
  ],
  hard:[
    {title:"Extract a column",desc:"Print only the 3rd column from 'data.csv' using awk.",hint:"hint: awk -F',' '{print $3}'",check:c=>/^awk\s+-F[','"'"']\s*[','"'"']\s*['"]?\{print\s+\$3\}['"]?\s+data\.csv$/.test(c)||c.trim()==="awk -F',' '{print $3}' data.csv"||c.trim()==='awk -F"," \'{print $3}\' data.csv',sim:'col3_a\ncol3_b\ncol3_c',diff:'hard',time:35,pts:350},
    {title:"Replace in file",desc:"Replace all 'foo' with 'bar' in 'config.txt' in-place.",hint:"hint: sed -i 's/foo/bar/g' file",check:c=>/^sed\s+-i\s+['"]?s\/foo\/bar\/g['"]?\s+config\.txt$/.test(c.trim()),sim:'(file updated)',diff:'hard',time:30,pts:350},
    {title:"Background process",desc:"Run 'sleep 100' in the background.",hint:"hint: command &",check:c=>c.trim()==='sleep 100 &',sim:'[1] 9823',diff:'hard',time:20,pts:300},
    {title:"Chain commands",desc:"Create directory 'newdir', then create 'newdir/file.txt' in one line.",hint:"hint: cmd1 && cmd2",check:c=>/^mkdir\s+newdir\s*&&\s*touch\s+newdir\/file\.txt$/.test(c.trim()),sim:'(done)',diff:'hard',time:35,pts:350},
    {title:"Set file permissions",desc:"Make 'script.sh' executable by the owner only.",hint:"hint: chmod u+x or chmod 700",check:c=>/^chmod\s+(u\+x|700|100)\s+script\.sh$/.test(c.trim()),sim:'',diff:'hard',time:30,pts:350},
    {title:"Reverse a file",desc:"Print the lines of 'log.txt' in reverse order.",hint:"hint: tac command",check:c=>/^tac\s+log\.txt$/.test(c.trim()),sim:'Line 10\nLine 9\nLine 8\n...',diff:'hard',time:25,pts:320},
    {title:"Find & kill process",desc:"Find the PID of 'node' and kill it using two piped commands.",hint:"hint: pgrep node | xargs kill",check:c=>/^pgrep\s+node\s*\|\s*xargs\s+kill/.test(c.trim()),sim:'',diff:'hard',time:40,pts:400},
    {title:"Redirect output",desc:"Save the output of 'ls -la' to a file named 'listing.txt'.",hint:"hint: use > to redirect",check:c=>/^ls\s+-la\s*>\s*listing\.txt$/.test(c.trim()),sim:'',diff:'hard',time:25,pts:300},
  ]
};

class GameState {
  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('shellShockGame');
    if (stored) {
      const data = JSON.parse(stored);
      Object.assign(this, data);
    } else {
      this.reset();
    }
  }

  reset() {
    this.diff = 'easy';
    this.tasks = [];
    this.cur = 0;
    this.score = 0;
    this.streak = 0;
    this.timeLeft = 30;
    this.timeMax = 30;
    this.tStart = 0;
    this.log = [];
    this.hist = [];
    this.histIdx = -1;
    this.stats = { best: null, runs: 0, totalTasks: 0 };
    this.lb = [];
  }

  save() {
    localStorage.setItem('shellShockGame', JSON.stringify(this));
  }

  pickDiff(d) {
    this.diff = d;
    this.save();
  }

  setTasks(tasks) {
    this.tasks = tasks;
    this.cur = 0;
    this.score = 0;
    this.streak = 0;
    this.log = [];
    this.hist = [];
    this.histIdx = -1;
    this.save();
  }

  updateTask(index, data) {
    if (this.cur === index) {
      Object.assign(this, data);
      this.save();
    }
  }

  logTask(taskData) {
    this.log.push(taskData);
    this.save();
  }

  async finishGame(completed) {
    this.stats.runs++;
    const done = this.log.filter(x => x.done).length;
    this.stats.totalTasks += done;
    if (this.stats.best === null || this.score > this.stats.best) {
      this.stats.best = this.score;
    }
    
    const runData = {
      score: this.score,
      diff: this.diff,
      done: done,
      total: this.tasks.length,
      ts: Date.now()
    };
    
    this.lb.push(runData);
    this.lb.sort((a, b) => b.score - a.score);
    if (this.lb.length > 10) this.lb.length = 10;
    
    this.save();
    
    // Save to Supabase if available and user is logged in
    if (isSupabaseEnabled() && getCurrentUser()) {
      await saveGameRun({
        difficulty: this.diff,
        score: this.score,
        tasksCompleted: done,
        tasksTotal: this.tasks.length,
        durationSeconds: Math.round((Date.now() - this.tStart) / 1000)
      });
    }
  }

  async clearLeaderboard() {
    this.lb = [];
    this.save();
  }

  async loadLeaderboardFromSupabase() {
    if (isSupabaseEnabled()) {
      const supabaseLeaderboard = await fetchLeaderboard(null, 10);
      if (supabaseLeaderboard && supabaseLeaderboard.length > 0) {
        this.lb = supabaseLeaderboard.map(item => ({
          score: item.score,
          diff: item.difficulty,
          done: item.tasks_completed,
          total: item.tasks_total,
          ts: new Date(item.created_at).getTime()
        }));
      }
    }
  }

  getFormattedScore() {
    if (this.score === 0) return '—';
    return this.score;
  }
}

const G = new GameState();

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function startGameSession() {
  const pool = TASKS[G.diff];
  const selectedTasks = shuffle(pool).slice(0, 5);
  G.setTasks(selectedTasks);
  window.location.href = 'game.html';
}
