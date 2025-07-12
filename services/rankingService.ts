import { MatchResult, Match } from '@/models/match';
import { fetchPlayers } from './playerService';
import { PlayerRanking } from '@/models/playerRanking';

// Calculate rankings for all players based on match history
export async function calculateRankings(matches: Match[]): Promise<PlayerRanking[]> {
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
        // Score is now just wins * 2 (no draws)
        ranking.score = ranking.wins * 2;
    });
    // Convert to array, filter out players with 0 matches, and sort by score (descending)
    return Object.values(rankings)
        .filter(ranking => ranking.matchesPlayed > 0)
        .sort((a, b) => b.score - a.score);
}

// Always compute rankings at render time
export async function fetchRankings(): Promise<PlayerRanking[]> {
    const { fetchMatches } = await import('./matchService');
    const matches = await fetchMatches();
    return calculateRankings(matches);
}
