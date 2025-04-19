'use client';

import { PlayerComponent } from '@/components/player';
import { Player } from '@/models/player';
import { useQuery, useMutation } from '@tanstack/react-query';

async function savePlayers(updatedPlayers: Player[]): Promise<Player[]> {
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    return updatedPlayers;
}

export default function Players() {
    const { data: players, isLoading, error } = useQuery<Player[]>({
        queryKey: ['players'],
        queryFn: fetchPlayers,
    });

    const savePlayersMutation = useMutation({
        mutationFn: savePlayers,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading players</div>;

    return (
        <>
            <header>Players</header>
            {players?.map((player: Player) => (
                <PlayerComponent key={player.id} player={player} onPressedChange={(pressed) => {
                    player.active = pressed;
                    savePlayersMutation.mutate(players);
                }} />
            ))}
        </>
    );
}

async function fetchPlayers(): Promise<Player[]> {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}