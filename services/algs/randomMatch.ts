import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { Match } from '@/models/match';
import { shuffle } from './utils';

export async function randomMatch(): Promise<Match> {
    const players = await fetchPlayers();
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    if (activePlayers.length < 4) {
        throw new Error('Not enough active players to create a match');
    }

    shuffle(activePlayers);

    return new Match(activePlayers.slice(0, 2), activePlayers.slice(2, 4), activePlayers);
}
