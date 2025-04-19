'use client';

import { PlayerComponent } from '@/components/player';
import { Player } from '@/models/player';
import { useQuery, useMutation } from '@tanstack/react-query';

import { v4 as uuidv4 } from 'uuid';

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
            <div className='flex flex-col w-full h-full'>
                <header>
                    <h1 className='text-3xl px-2'>Players</h1>
                </header>
                <div>
                {players?.map((player: Player) => (
                    <PlayerComponent key={player.id} player={player} onPlayerChange={(newPlayer) => {
                        player = {...player, ...newPlayer};
                        savePlayersMutation.mutate(players);
                    }} />
                ))}
                </div>
                <footer>
                    <button onClick={() => {
                        const newPlayer: Player = { id: uuidv4(), name: 'New Player', active: false };
                        players?.push(newPlayer);
                        savePlayersMutation.mutate(players);
                    }}>Add Player</button>
                </footer>
            </div>
        </>
    );
}

async function fetchPlayers(): Promise<Player[]> {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}