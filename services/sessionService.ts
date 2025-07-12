import { Match } from '@/models/match';
import { fetchMatches, clearMatches } from './matchService';

export async function fetchSessions(): Promise<Match[][]> {
    const storedSessions = localStorage.getItem('sessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
}

export async function saveSessions(sessions: Match[][]): Promise<Match[][]> {
    localStorage.setItem('sessions', JSON.stringify(sessions));
    return sessions;
}

export async function newSession(): Promise<void> {
    const matches = await fetchMatches();
    if (matches.length === 0) return; // No matches to save
    const sessions = await fetchSessions();
    sessions.push(matches);
    await saveSessions(sessions);
    await clearMatches();
}

export async function clearSessions(): Promise<void> {
    localStorage.removeItem('sessions');
}
