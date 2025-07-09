import { Match, MatchResult } from '@/models/match';
import { fetchMatchAlgorithm } from '@/services/matchAlgorithmService';
import { MATCH_ALGORITHMS } from './algs';
import { fetchTables } from './tableService';
import { fetchPlayers } from './playerService';
import { Player } from '@/models/player';

export async function fetchMatches(): Promise<Match[]> {
    const storedMatches = localStorage.getItem('matches');
    return storedMatches ? JSON.parse(storedMatches) : [];
}

export async function saveMatches(matches: Match[]): Promise<Match[]> {
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
}

// Helper function to get players who are currently playing on tables
export async function getPlayersCurrentlyPlaying(): Promise<Record<string, string>> {
    const matches = await fetchMatches();
    const playerTableMap: Record<string, string> = {};
    
    // Find the most recent unfinished match for each table
    const activeTableMatches: Record<string, Match> = {};
    
    for (const match of matches) {
        if (match.result === MatchResult.NotPlayed) {
            // This is an active match
            activeTableMatches[match.tableId] = match;
        }
    }
    
    // Map players to their current tables
    for (const tableId in activeTableMatches) {
        const match = activeTableMatches[tableId];
        const activePlayers = [...match.team1, ...match.team2];
        
        for (const playerId of activePlayers) {
            playerTableMap[playerId] = tableId;
        }
    }
    
    return playerTableMap;
}

export async function generateMatch(tableId?: string): Promise<Match[]> {
    const algorithm = await fetchMatchAlgorithm();
    const handler = MATCH_ALGORITHMS[algorithm];
    
    if (!handler) {
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }

    const matches = await fetchMatches();
    const playerTableMap = await getPlayersCurrentlyPlaying();
    const tables = await fetchTables();
    
    // Sort tables to ensure primary table is first
    const sortedTables = [...tables].filter(table => table.active).sort((a, b) => {
        // Primary table (Table 1) should be first
        if (a.name.toLowerCase().includes('table 1') || a.name.toLowerCase().includes('primary')) return -1;
        if (b.name.toLowerCase().includes('table 1') || b.name.toLowerCase().includes('primary')) return 1;
        return 0;
    });
    
    const primaryTableId = sortedTables.length > 0 ? sortedTables[0].id : null;
    
    if (tableId) {
        // Generate match for a specific table
        try {
            // Only generate matches for primary table or if there are enough players
            if (tableId === primaryTableId || await hasEnoughAvailablePlayers(tableId, playerTableMap)) {
                const match = await handler(tableId, playerTableMap);
                if (match) {
                    matches.push(match);
                }
            } else {
                console.log(`Not enough available players to create a match on this table. Some players may be playing on other tables.`);
            }
        } catch (error) {
            console.error(`Failed to generate match for table ${tableId}:`, error);
        }
    } else {
        // Generate matches for all active tables, starting with primary table
        for (const table of sortedTables) {
            try {
                // Only generate matches for primary table or if there are enough players
                if (table.id === primaryTableId || await hasEnoughAvailablePlayers(table.id, playerTableMap)) {
                    const match = await handler(table.id, playerTableMap);
                    if (match) {
                        matches.push(match);
                        
                        // Update playerTableMap after each match generation to account for newly assigned players
                        const newlyAssignedPlayers = [...match.team1, ...match.team2];
                        for (const playerId of newlyAssignedPlayers) {
                            playerTableMap[playerId] = table.id;
                        }
                    }
                } else {
                    console.log(`Skipping match generation for ${table.name} due to insufficient available players.`);
                }
            } catch (error) {
                console.error(`Failed to generate match for table ${table.id}:`, error);
            }
        }
    }
    
    return await saveMatches(matches);
}

// Helper function to check if there are enough available players for a table
async function hasEnoughAvailablePlayers(tableId: string, playerTableMap: Record<string, string>): Promise<boolean> {
    const players = await fetchPlayers();
    const activePlayers = players.filter(player => player.active);
    
    // If we have 4 or fewer active players total, always allow match generation
    if (activePlayers.length <= 4) {
        return activePlayers.length >= 4;
    }
    
    // Otherwise, check if there are enough available players for this specific table
    const availablePlayers = activePlayers.filter((player: Player) => {
        // If player is assigned to a table and it's not this table, they're unavailable
        const assignedTable = playerTableMap[player.id];
        return !assignedTable || assignedTable === tableId;
    });
    
    return availablePlayers.length >= 4;
}

export async function clearMatches(): Promise<void> {
    localStorage.removeItem('matches');
}