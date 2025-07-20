'use client';

import { EditPlayerDialog } from '@/components/edit-player-dialog';
import { PlayerComponent } from '@/components/player';
import { Player } from '@/models/player';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlayers, savePlayers } from '@/services/playerService'; // Import from new file
import { Separator } from '@/components/ui/separator';

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

    // Sort players alphabetically by name
    const sortedPlayers = [...(players || [])].sort((a, b) => a.name.localeCompare(b.name));
    const activePlayers = sortedPlayers.filter(p => p.active);
    const inactivePlayers = sortedPlayers.filter(p => !p.active);

    // Helper to safely update players
    const handlePlayerChange = (player: Player) => {
        if (!players) return;
        const idx = players.findIndex(p => p.id === player.id);
        if (idx !== -1) {
            players[idx] = player;
            savePlayersMutation.mutate([...players]);
        }
    };

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
                    {activePlayers.map((player: Player) => (
                        <PlayerComponent key={player.id} player={player} onPlayerChange={handlePlayerChange} />
                    ))}
                </div>
                {inactivePlayers.length > 0 && (
                    <div className="w-full my-4">
                        <Separator />
                    </div>
                )}
                <div className='flex flex-wrap'>
                    {inactivePlayers.map((player: Player) => (
                        <PlayerComponent key={player.id} player={player} onPlayerChange={handlePlayerChange} />
                    ))}
                </div>
            </div>
        </>
    );
}