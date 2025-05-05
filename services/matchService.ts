import { Match } from '@/models/match';
import { fetchMatchAlgorithm } from '@/services/matchAlgorithmService';
import { MATCH_ALGORITHMS } from './algs';

export async function fetchMatches(): Promise<Match[]> {
    const storedMatches = localStorage.getItem('matches');
    return storedMatches ? JSON.parse(storedMatches) : [];
}

export async function saveMatches(matches: Match[]): Promise<Match[]> {
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
}

export async function generateMatch(): Promise<Match[]> {
    const algorithm = await fetchMatchAlgorithm(); // Read the algorithm from matchAlgorithmService

    const handler = MATCH_ALGORITHMS[algorithm];
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