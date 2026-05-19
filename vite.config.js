import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        difficulty: resolve(__dirname, 'difficulty.html'),
        gameLeaderboard: resolve(__dirname, 'game-leaderboard.html'),
        game: resolve(__dirname, 'game.html'),
        leaderboard: resolve(__dirname, 'leaderboard.html'),
        results: resolve(__dirname, 'results.html')
      }
    }
  }
});
