'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearPlayers } from '@/services/playerService';
import { clearMatches } from '@/services/matchService';
import { updateMatchAlgorithm } from '@/services/matchAlgorithmService'; // Import the new service
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Settings() {
    const queryClient = useQueryClient();
    const matchAlgorithmMutation = useMutation({
        mutationFn: updateMatchAlgorithm, // Use the service function
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matchAlgorithm'], // Invalidate query
            });
        },
    });

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
            <div className='flex flex-col h-full items-center justify-center'>
                <div className="flex items-baseline mb-4">
                    <Label htmlFor="match-algorithm" className="m-2">Match Algorithm</Label>
                    <Select
                        value={matchAlgorithmMutation.variables || 'Random'}
                        onValueChange={(value) => matchAlgorithmMutation.mutate(value)}
                    >
                        <SelectTrigger id="match-algorithm" className="w-[180px]">
                            <SelectValue placeholder="Select an algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Random">Random</SelectItem>
                            <SelectItem value="Expectation">Expectation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Button variant="destructive" className='cursor-pointer m-2' onClick={() => clearMatchesMutation.mutate()}>Clear Matches</Button>
                    <Button variant="destructive" className='cursor-pointer m-2' onClick={() => {
                        clearMatchesMutation.mutate();
                        clearPlayersMutation.mutate();
                    }}>Clear All</Button>
                </div>
            </div >
        </>
    );
}