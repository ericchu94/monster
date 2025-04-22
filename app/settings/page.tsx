'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearPlayers } from '@/services/playerService'; // Import from new file

import { clearMatches } from '@/services/matchService';
import { Button } from '@/components/ui/button';

export default function Settings() {
    const queryClient = useQueryClient();

    const clearPlayersMutation = useMutation({
        mutationFn: clearPlayers,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['players'],
            }); // Refetch matches
        },
    });

    const clearMatchesMutation = useMutation({
        mutationFn: clearMatches,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            }); // Refetch matches
        },
    });

    return (
        <>
            <div>
                <Button variant="destructive" className='cursor-pointer m-2' onClick={() => clearMatchesMutation.mutate()}>Clear Matches</Button>
                <Button variant="destructive" className='cursor-pointer m-2' onClick={() => {
                    clearMatchesMutation.mutate();
                    clearPlayersMutation.mutate();
                }}>Clear All</Button>
            </div >
        </>
    );
}