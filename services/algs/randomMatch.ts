import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { Match } from '@/models/match';
import { shuffle } from './utils';

export async function randomMatch(tableId: string, playerTableMap: Record<string, string> = {}): Promise<Match | null> {
    const players = await fetchPlayers();
    
    // Filter out players who are currently playing on other tables
    const availablePlayers = players.filter((player: Player) => {
        if (!player.active) return false;
        
        // If player is assigned to a table and it's not this table, they're unavailable
        const assignedTable = playerTableMap[player.id];
        return !assignedTable || assignedTable === tableId;
    }).map((player: Player) => player.id);

    if (availablePlayers.length < 4) {
        // Not enough players, return null
        console.log(`Not enough available players to create a match on table ${tableId}.`);
        return null;
    }

    shuffle(availablePlayers);

    // Get all active players for the activePlayers field (used for tracking expected play counts)
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    return new Match(availablePlayers.slice(0, 2), availablePlayers.slice(2, 4), activePlayers, tableId);
}
