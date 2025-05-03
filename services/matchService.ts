import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { Match } from '@/models/match';
import { fetchMatchAlgorithm } from '@/services/matchAlgorithmService';
import { MatchAlgorithm } from '@/models/matchAlgorithm'; // Import the enum

export async function fetchMatches(): Promise<Match[]> {
    const storedMatches = localStorage.getItem('matches');
    return storedMatches ? JSON.parse(storedMatches) : [];
}

export async function saveMatches(matches: Match[]): Promise<Match[]> {
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
}

async function randomMatch(): Promise<Match> {
    const players = await fetchPlayers();
    const playerIds = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    if (playerIds.length < 4) {
        throw new Error('Not enough active players to create a match');
    }

    shuffle(playerIds);

    return new Match(playerIds.slice(0, 2), playerIds.slice(2, 4));
}

export async function generateMatch(): Promise<Match[]> {
    const algorithm = await fetchMatchAlgorithm(); // Read the algorithm from matchAlgorithmService

    let match: Match;

    if (algorithm === MatchAlgorithm.Random) { // Use the enum
        match = await randomMatch();
    } else {
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }

    const matches = await fetchMatches();
    matches.push(match);
    return await saveMatches(matches);
}

export async function clearMatches(): Promise<void> {
    localStorage.removeItem('matches');
}

function shuffle<T>(array: T[]): T[] {
    // Fisher-Yates shuffle algorithm
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}
