'use client';

import { Player } from '@/models/player';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchPlayers } from '../players/page';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

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
async function saveMatches(matches: Match[]): Promise<Match[]> {
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches;
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

    const team1 = players.slice(0, 2);
    const team2 = players.slice(2, 4);

    const match: Match = {
        id: uuidv4(),
        team1,
        team2,
        result: MatchResult.NotPlayed,
        createdAt: new Date().toISOString(),
    };
    matches.push(match);

    return await saveMatches(matches);
}

function TeamComponent({ team, winner, onPressedChange }: { team: Player[], winner: boolean, onPressedChange: (pressed: boolean) => void }) {
    return (
        <Toggle pressed={winner} variant="outline" className="self-stretch grow inline-flex items-center justify-center flex-col border rounded-md m-2 p-2" onPressedChange={onPressedChange}>
            {team.map(player => (
                <div key={player.id}>{player.name}</div>
            ))}
        </Toggle>
    );
}

function MatchComponent({ match, onMatchChange }: { match: Match, onMatchChange: (match: Match) => void }) {
    return (
        <div className="flex flex-col sm:flex-row w-full h-full items-center justify-center snap-start">
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


    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading matches</div>;

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className="grow h-full overflow-y-auto snap-y snap-mandatory">
                    {matches!.length > 0 ? (
                        matches!.map((match: Match) => (
                            <MatchComponent key={match.id} match={match} onMatchChange={(match) => {
                                match.result = match.result;
                                saveMatchesMutation.mutate(matches!);
                            }} />
                        ))
                    ) : (
                        <div>No matches found</div>
                    )}
                </div>
                <Button variant="outline" onClick={() => {
                    generateMatchMutation.mutate();
                }}>
                    <Plus />
                </Button>
            </div>
        </>
    );
}