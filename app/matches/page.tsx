'use client';

import { Player } from '@/models/player';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchPlayers } from '../players/page';
import { v4 as uuidv4 } from 'uuid';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

enum MatchResult {
    NotPlayed = 'NotPlayed', // Default state for matches not played
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
    Draw = 'Draw',
}

type Match = {
    id: string;
    team1: Player[];
    team2: Player[];
    result: MatchResult; // Use enum for result
    createdAt: string; // Add created timestamp
};

async function fetchMatches(): Promise<Match[]> {
    const storedMatches = localStorage.getItem('matches');
    return storedMatches ? JSON.parse(storedMatches) : [];
}

async function generateMatch(): Promise<Match[]> {
    const matches = await fetchMatches();

    let players = await fetchPlayers();
    players = players.filter((player: Player) => player.active);
    
    if (players.length < 4) {
        return matches;
    }

    // shuffle 
    players = players.sort(() => Math.random() - 0.5);

    const team1= players.slice(0, 2);
    const team2 = players.slice(2, 4);

    const match: Match = {
        id: uuidv4(),
        team1,
        team2,
        result: MatchResult.NotPlayed,
        createdAt: new Date().toISOString(),
    };
    matches.push(match);

    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
}

export default function Matches() {
    const queryClient = useQueryClient();
    const { data: matches, isLoading, error } = useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: fetchMatches,
    });

    const mutation = useMutation({
        mutationFn: generateMatch,
        onSuccess: () => {
            queryClient.invalidateQueries(['matches']); // Refetch matches
        },
    });

    const handleGenerateMatch = () => {
        mutation.mutate();
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading matches</div>;

    return (
        <>
            <div className="flex flex-col w-full h-full">
                {matches!.length > 0 ? (
                    matches!.map((match: Match) => (
                        <div key={match.id}>{JSON.stringify(match)}</div>
                    ))
                ) : (
                    <div>No matches found</div>
                )}
                <Button onClick={handleGenerateMatch}>
                    <Plus />
                </Button>
            </div>
        </>
    );
}