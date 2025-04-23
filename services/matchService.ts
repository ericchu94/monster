import { Player } from '@/models/player';
import { v4 as uuidv4 } from 'uuid';
import { fetchPlayers } from '@/services/playerService';

export enum MatchResult {
    NotPlayed = 'NotPlayed',
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
    Draw = 'Draw',
}

export type Match = {
    id: string;
    team1: Player[];
    team2: Player[];
    result: MatchResult;
    createdAt: string;
};

export async function fetchMatches(): Promise<Match[]> {
    const storedMatches = localStorage.getItem('matches');
    return storedMatches ? JSON.parse(storedMatches) : [];
}

export async function saveMatches(matches: Match[]): Promise<Match[]> {
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
}

export async function generateMatch(): Promise<Match[]> {
    const matches = await fetchMatches();

    let players = await fetchPlayers();
    players = players.filter((player: Player) => player.active);

    if (players.length < 4) {
        return matches;
    }

    // Shuffle players
    shuffle(players);

    const team1 = players.slice(0, 2);
    const team2 = players.slice(2, 4);

    const match: Match = {
        id: uuidv4(),
        team1,
        team2,
        result: MatchResult.NotPlayed,
        createdAt: new Date().toISOString(),
    };
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
