'use client';

import { useQuery } from '@tanstack/react-query';

type Player = {
    id: string;
    name: string;
};

export default function Players() {
    const { data: players, isLoading, error } = useQuery<Player[]>({
        queryKey: ['players'],
        queryFn: fetchPlayers,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading players</div>;

    return (
        <ul>
            {players.map((player: Player) => (
                <li key={player.id}>{player.name}</li>
            ))}
        </ul>
    );
}

async function fetchPlayers(): Promise<Player[]> {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}