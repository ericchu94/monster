'use client';

import { EditPlayerDialog } from '@/components/edit-player-dialog';
import { PlayerComponent } from '@/components/player';
import { Player } from '@/models/player';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlayers, savePlayers } from '@/services/playerService';
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
            });
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading players</div>;

    return (
        <div className='flex flex-col w-full h-full'>
            <header className="flex justify-between items-center p-4">
                <h1 className='text-3xl'>Players</h1>
            </header>
            <div className='flex flex-wrap p-2 pb-20'>
                {players?.map((player: Player, index) => (
                    <PlayerComponent key={player.id} player={player} onPlayerChange={(newPlayer) => {
                        const updatedPlayers = [...players];
                        updatedPlayers[index] = newPlayer;
                        savePlayersMutation.mutate(updatedPlayers);
                    }} />
                ))}
            </div>
            
            {/* Floating Action Button for adding new players */}
            <EditPlayerDialog 
                mode='create' 
                player={{ id: uuidv4(), name: '', active: true }} 
                onPlayerChange={(newPlayer) => {
                    if (players) {
                        const updatedPlayers = [...players, newPlayer];
                        savePlayersMutation.mutate(updatedPlayers);
                    }
                }} 
            />
        </div>
    );
}