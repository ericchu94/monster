'use client';

import { Match, MatchResult } from '@/models/match'; // Import Match and MatchResult
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Play, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useRef, useEffect } from 'react';
import { fetchMatches, saveMatches, generateMatch } from '@/services/matchService'; // Import from matchService
import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService'; // Import a service to fetch player details

function TeamComponent({ team, winner, onPressedChange }: { team: string[], winner: boolean, onPressedChange: (pressed: boolean) => void }) {
    const { data: players } = useQuery({
        queryKey: ['players'],
        queryFn: fetchPlayers, // Fetch all players
    });

    const teamPlayers = players?.filter((player: Player) => team.includes(player.id)) || [];

    return (
        <Toggle pressed={winner} variant="outline" className="self-stretch basis-0 h-auto grow flex flex-col items-center justify-center cursor-pointer border rounded-md m-2 p-2 bg-input/20" onPressedChange={onPressedChange}>
            {teamPlayers.map(player => (
                <div key={player.id} className='text-4xl'>{player.name}</div>
            ))}
        </Toggle>
    );
}

function MatchComponent({ match, onMatchChange, ref }: { match: Match, onMatchChange: (match: Match) => void, ref?: React.Ref<HTMLDivElement> }) {
    return (
        <div ref={ref} className="flex portrait:flex-col landscape:flex-row h-full items-center justify-center snap-start">
            <TeamComponent team={match.team1} winner={match.result == MatchResult.Team1Win} onPressedChange={(pressed) => {
                match.result = pressed ? MatchResult.Team1Win : MatchResult.NotPlayed;
                onMatchChange(match);
            }} />
            <Swords />
            <TeamComponent team={match.team2} winner={match.result == MatchResult.Team2Win} onPressedChange={(pressed) => {
                match.result = pressed ? MatchResult.Team2Win : MatchResult.NotPlayed;
                onMatchChange(match);
            }} />
        </div>
    );
}

export default function Matches() {
    const queryClient = useQueryClient();
    const { data: matches, isLoading, error } = useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: fetchMatches,
    });

    const generateMatchMutation = useMutation({
        mutationFn: generateMatch,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            }); // Refetch matches
        },
    });

    const saveMatchesMutation = useMutation({
        mutationFn: saveMatches,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            }); // Refetch matches
        },
    });

    const lastMatchRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (lastMatchRef.current) {
            lastMatchRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [matches]);

    const handleMatchChange = (updatedMatch: Match) => {
        const allMatches = matches!.map(match =>
            match.id === updatedMatch.id ? updatedMatch : match
        );
        saveMatchesMutation.mutate(allMatches);

        // Check if the last match is concluded
        const lastMatch = allMatches[allMatches.length - 1];
        if (lastMatch.result !== MatchResult.NotPlayed) {
            generateMatchMutation.mutate();
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading matches</div>;

    if (matches?.length === 0) {
        return (
            <div className='flex w-full h-full items-center justify-center'>
                <Button variant={'outline'} className="cursor-pointer h-auto w-auto" onClick={() => {
                    generateMatchMutation.mutate();
                }}>
                    <Play className='m-2' size={128} />
                </Button></div>);
    }

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className="grow overflow-auto snap-y snap-mandatory basis-0">
                    {matches!.map((match: Match, index: number) => (
                        <MatchComponent
                            key={match.id}
                            match={match}
                            onMatchChange={handleMatchChange}
                            ref={index === matches!.length - 1 ? lastMatchRef : undefined}
                        />
                    ))}
                </div>
                <Button variant="outline" className="m-2 cursor-pointer bg-transparent dark:bg-transparent text-input" onClick={() => {
                    generateMatchMutation.mutate();
                }}>
                    Skip
                </Button>
            </div>
        </>
    );
}