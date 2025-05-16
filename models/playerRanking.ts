export interface PlayerRanking {
    playerId: string;
    wins: number;
    losses: number;
    draws: number;
    matchesPlayed: number;
    winRate: number;
    score: number; // Overall score for ranking
}

// Calculate a score based on wins, losses, and draws
export function calculateScore(wins: number, losses: number, draws: number): number {
    // Simple scoring formula: 3 points for win, 1 point for draw, 0 for loss
    return wins * 3 + draws * 1;
}
