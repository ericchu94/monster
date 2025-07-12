'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery
import { clearPlayers } from '@/services/playerService';
import { newSession, clearSessions } from '@/services/sessionService';
import { updateMatchAlgorithm, fetchMatchAlgorithm } from '@/services/matchAlgorithmService'; // Import fetchMatchAlgorithm
import { MatchAlgorithm } from '@/models/matchAlgorithm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Settings() {
    const queryClient = useQueryClient();

    const { data: currentAlgorithm = MatchAlgorithm.Random } = useQuery({
        queryKey: ['matchAlgorithm'], // Query key
        queryFn: fetchMatchAlgorithm, // Fetch the current algorithm
    });

    const matchAlgorithmMutation = useMutation({
        mutationFn: updateMatchAlgorithm,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matchAlgorithm'],
            });
        },
    });

    const clearPlayersMutation = useMutation({
        mutationFn: clearPlayers,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['players'],
            });
        },
    });

    const newSessionMutation = useMutation({
        mutationFn: newSession,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
            // Optionally, invalidate sessions if you add a query for them
        },
    });

    const clearSessionsMutation = useMutation({
        mutationFn: async () => {
            await clearSessions();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
            // Optionally, invalidate sessions if you add a query for them
        },
    });

    return (
        <>
            <div className='flex flex-col h-full items-center justify-center'>
                <div className="flex items-baseline mb-4">
                    <Label htmlFor="match-algorithm" className="m-2">Match Algorithm</Label>
                    <Select
                        value={currentAlgorithm} // Use the fetched algorithm
                        onValueChange={(value) => matchAlgorithmMutation.mutate(value as MatchAlgorithm)}
                    >
                        <SelectTrigger id="match-algorithm" className="w-[180px]">
                            <SelectValue placeholder="Select an algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(MatchAlgorithm).map((algorithm) => (
                                <SelectItem key={algorithm} value={algorithm}>
                                    {algorithm}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Button variant="default" className='cursor-pointer m-2' onClick={() => newSessionMutation.mutate()}>New Session</Button>
                    <Button variant="destructive" className='cursor-pointer m-2' onClick={() => clearSessionsMutation.mutate()}>Clear Sessions</Button>
                    <Button variant="destructive" className='cursor-pointer m-2' onClick={() => {
                        clearSessionsMutation.mutate();
                        clearPlayersMutation.mutate();
                    }}>Clear All</Button>
                </div>
            </div >
        </>
    );
}