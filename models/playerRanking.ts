export interface PlayerRanking {
    playerId: string;
    wins: number;
    losses: number;
    matchesPlayed: number;
    winRate: number;
    score: number; // Overall score for ranking
}
