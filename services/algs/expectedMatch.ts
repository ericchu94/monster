import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { fetchMatches } from '@/services/matchService';
import { Match } from '@/models/match';
import { shuffle, weightedShuffle } from './utils';

export async function expectedMatch(tableId: string, playerTableMap: Record<string, string> = {}): Promise<Match | null> {
    const matches = await fetchMatches();
    const players = await fetchPlayers();

    const playerWeights = Object.fromEntries(
        players.map((player: Player) => [player.id, 0])
    );
    
    for (const match of matches) {
        const expectedValue = 4 / match.activePlayers.length;

        for (const playerId of match.activePlayers) {
            playerWeights[playerId] += expectedValue;

            if (match.team1.includes(playerId) || match.team2.includes(playerId)) {
                playerWeights[playerId] -= 1;
            }
        }
    }

    const minWeight = Math.min(...Object.values(playerWeights));
    const normalizedWeights = Object.fromEntries(
        Object.entries(playerWeights).map(([playerId, weight]) => [
            playerId,
            weight - minWeight + 1,
        ])
    );

    for (const player of players) {
        console.log(`Player: ${player.name}, Weight: ${normalizedWeights[player.id]}`);
    }

    // Filter out players who are currently playing on other tables
    const availablePlayers = players.filter((player: Player) => {
        if (!player.active) return false;
        
        // If player is assigned to a table and it's not this table, they're unavailable
        const assignedTable = playerTableMap[player.id];
        return !assignedTable || assignedTable === tableId;
    }).map((player: Player) => player.id);

    if (availablePlayers.length < 4) {
        // Log warning instead of showing an alert
        console.warn(`Not enough available players to create a match on this table. Some players may be playing on other tables.`);
        return null;
    }

    const weightedActivePlayers = availablePlayers.map((playerId) => ({
        value: playerId,
        weight: normalizedWeights[playerId],
    }));
    
    weightedShuffle(weightedActivePlayers);

    const selected = weightedActivePlayers.slice(0, 4).map((player) => player.value);
    shuffle(selected);

    // Get all active players for the activePlayers field (used for tracking expected play counts)
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    return new Match(selected.slice(0, 2), selected.slice(2, 4), activePlayers, tableId);
}