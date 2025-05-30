import { Match, MatchResult } from '@/models/match';
import { fetchMatches } from './matchService';
import { fetchPlayers } from './playerService';
import { PlayerRanking } from '@/models/playerRanking';

// Calculate rankings for all players based on match history
export async function calculateRankings(): Promise<PlayerRanking[]> {
    const matches = await fetchMatches();
    const players = await fetchPlayers();
    
    // Initialize rankings with zero values for all players
    const rankings: Record<string, PlayerRanking> = {};
    
    players.forEach(player => {
        rankings[player.id] = {
            playerId: player.id,
            wins: 0,
            losses: 0,
            matchesPlayed: 0,
            winRate: 0,
            score: 0
        };
    });
    
    // Process each match to update player statistics
    matches.forEach(match => {
        // Skip matches that haven't been played yet
        if (match.result === MatchResult.NotPlayed) {
            return;
        }
        // Update stats for team 1 players
        match.team1.forEach(playerId => {
            if (rankings[playerId]) {
                rankings[playerId].matchesPlayed++;
                if (match.result === MatchResult.Team1Win) {
                    rankings[playerId].wins++;
                } else if (match.result === MatchResult.Team2Win) {
                    rankings[playerId].losses++;
                }
            }
        });
        // Update stats for team 2 players
        match.team2.forEach(playerId => {
            if (rankings[playerId]) {
                rankings[playerId].matchesPlayed++;
                if (match.result === MatchResult.Team2Win) {
                    rankings[playerId].wins++;
                } else if (match.result === MatchResult.Team1Win) {
                    rankings[playerId].losses++;
                }
            }
        });
    });
    // Calculate win rates and scores for all players
    Object.values(rankings).forEach(ranking => {
        if (ranking.matchesPlayed > 0) {
            ranking.winRate = ranking.wins / ranking.matchesPlayed;
        }
        // Score is now just wins * 3 (no draws)
        ranking.score = ranking.wins * 3;
    });
    // Convert to array and sort by score (descending)
    return Object.values(rankings).sort((a, b) => b.score - a.score);
}

// Save rankings to localStorage
export async function saveRankings(rankings: PlayerRanking[]): Promise<PlayerRanking[]> {
    localStorage.setItem('playerRankings', JSON.stringify(rankings));
    return rankings;
}

// Fetch rankings from localStorage
export async function fetchRankings(): Promise<PlayerRanking[]> {
    // Try to get from localStorage first
    const storedRankings = localStorage.getItem('playerRankings');
    if (storedRankings) {
        return JSON.parse(storedRankings);
    }
    
    // If not available, calculate fresh rankings
    return calculateRankings();
}

// Update rankings after a match result changes
export async function updateRankings(): Promise<PlayerRanking[]> {
    const rankings = await calculateRankings();
    return saveRankings(rankings);
}
