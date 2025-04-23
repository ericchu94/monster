'use client';

import { EditPlayerDialog } from '@/components/edit-player-dialog';
import { PlayerComponent } from '@/components/player';
import { Player } from '@/models/player';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlayers, savePlayers } from '@/services/playerService'; // Import from new file

import { v4 as uuidv4 } from 'uuid';

export default function Players() {
    const queryClient = useQueryClient();

    const { data: players, isLoading, error } = useQuery<Player[]>({
        queryKey: ['players'],
        queryFn: fetchPlayers,
    });

    const savePlayersMutation = useMutation({
        mutationFn: savePlayers,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['players'],
            }); // Refetch matches
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading players</div>;

    return (
        <>
            <div className='flex flex-col w-full h-full'>
                <header>
                    <h1 className='text-3xl px-2'>
                        Players
                        <EditPlayerDialog mode='create' player={{ id: uuidv4(), name: '', active: true }} onPlayerChange={(newPlayer) => {
                            players?.push(newPlayer);
                            savePlayersMutation.mutate(players!);
                        }} />
                    </h1>
                </header>
                <div className='flex flex-wrap'>
                    {players?.map((player: Player, index) => (
                        <PlayerComponent key={player.id} player={player} onPlayerChange={(newPlayer) => {
                            players[index] = newPlayer;
                            savePlayersMutation.mutate(players);
                        }} />
                    ))}
                </div>
            </div>
        </>
    );
}