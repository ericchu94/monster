import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { fetchMatches } from '@/services/matchService';
import { Match } from '@/models/match';
import { shuffle, weightedShuffle } from './utils';

export async function expectedMatch(): Promise<Match> {
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

    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);
    const weightedActivePlayers = activePlayers.map((playerId) => ({
        value: playerId,
        weight: normalizedWeights[playerId],
    }));
    
    weightedShuffle(weightedActivePlayers);

    const selected = weightedActivePlayers.slice(0, 4).map((player) => player.value);
    shuffle(selected);

    return new Match(selected.slice(0, 2), selected.slice(2, 4), activePlayers);
}