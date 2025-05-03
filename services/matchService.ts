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
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    if (activePlayers.length < 4) {
        throw new Error('Not enough active players to create a match');
    }

    shuffle(activePlayers);

    return new Match(activePlayers.slice(0, 2), activePlayers.slice(2, 4), activePlayers);
}

async function expectedMatch(): Promise<Match> {
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

    // log player weights and player names
    for (const player of players) {
        console.log(`Player: ${player.name}, Weight: ${normalizedWeights[player.id]}`);
    }

    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);
    const weightedActivePlayers = activePlayers.map((playerId) => ({
        value: playerId,
        weight: normalizedWeights[playerId],
    }));
    
    // weighted shuffle
    weightedShuffle(weightedActivePlayers);

    const selected = weightedActivePlayers.slice(0, 4).map((player) => player.value);
    shuffle(selected);

    return new Match(selected.slice(0, 2), selected.slice(2, 4), activePlayers);
}

const MATCH_ALGORITHM_HANDLERS: Record<MatchAlgorithm, () => Promise<Match>> = {
    [MatchAlgorithm.Random]: randomMatch,
    [MatchAlgorithm.Expected]: expectedMatch,
};

export async function generateMatch(): Promise<Match[]> {
    const algorithm = await fetchMatchAlgorithm(); // Read the algorithm from matchAlgorithmService

    const handler = MATCH_ALGORITHM_HANDLERS[algorithm];
    if (!handler) {
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }

    const match = await handler();
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

function weightedShuffle(arr: { value: unknown, weight: number }[]) {
    for (let i = 0; i < arr.length; i++) {
        const v = weightedIndexChoice(arr.slice(i));
        [arr[i + v], arr[i]] = [arr[i], arr[i + v]];
    }
}

function weightedIndexChoice(arr: { value: unknown, weight: number }[]): number {
    const totalWeight = arr.map(v => v.weight).reduce((x, y) => x + y);
    const val = Math.random() * totalWeight;
    for (let i = 0, cur = 0; ; i++) {
        cur += arr[i].weight;
        if (val <= cur) return i;
    }
}