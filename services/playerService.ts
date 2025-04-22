import { Player } from '@/models/player';

export async function fetchPlayers(): Promise<Player[]> {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}

export async function savePlayers(updatedPlayers: Player[]): Promise<Player[]> {
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    return updatedPlayers;
}

export async function clearPlayers(): Promise<void> {
    localStorage.removeItem('players');
}