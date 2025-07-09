'use client';

import { Match, MatchResult } from '@/models/match';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Play, ChevronsDown, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useRef, useEffect, useState } from 'react';
import { fetchMatches, saveMatches, generateMatch, getPlayersCurrentlyPlaying } from '@/services/matchService';
import { Player } from '@/models/player';
import { fetchPlayers } from '@/services/playerService';
import { Coin } from '@/components/coin';
import { fetchTables } from '@/services/tableService';
import { Table } from '@/models/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function TeamComponent({ team, winner, onPressedChange }: { team: string[], winner: boolean, onPressedChange: (pressed: boolean) => void }) {
    const { data: players } = useQuery({
        queryKey: ['players'],
        queryFn: fetchPlayers,
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
            <TeamComponent 
                team={match.team1} 
                winner={match.result == MatchResult.Team1Win} 
                onPressedChange={(pressed) => {
                    match.result = pressed ? MatchResult.Team1Win : MatchResult.NotPlayed;
                    onMatchChange(match);
                }} 
            />
            <Coin />
            <TeamComponent 
                team={match.team2} 
                winner={match.result == MatchResult.Team2Win} 
                onPressedChange={(pressed) => {
                    match.result = pressed ? MatchResult.Team2Win : MatchResult.NotPlayed;
                    onMatchChange(match);
                }} 
            />
        </div>
    );
}

function TableMatches({ tableId, tableName, matches, onMatchChange }: { tableId: string, tableName: string, matches: Match[], onMatchChange: (match: Match) => void, isPrimaryTable: boolean }) {
    const lastMatchRef = useRef<HTMLDivElement | null>(null);
    const queryClient = useQueryClient();
    const [scrolledToBottom, setScrolledToBottom] = useState(true);

    const generateMatchMutation = useMutation({
        mutationFn: (tableId: string) => generateMatch(tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
        },
    });

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement;
        setScrolledToBottom(Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <= 3.0);
    };

    useEffect(() => {
        if (lastMatchRef.current) {
            lastMatchRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [matches]);

    const tableMatches = matches.filter(match => match.tableId === tableId);

    if (tableMatches.length === 0) {
        return (
            <div className='flex w-full h-full items-center justify-center'>
                <Button 
                    variant={'outline'} 
                    className="cursor-pointer h-auto w-auto" 
                    onClick={() => {
                        generateMatchMutation.mutate(tableId);
                    }}
                >
                    <Play className='m-2' size={64} />
                    <div className="ml-2">Start Matches for {tableName}</div>
                </Button>
            </div>
        );
    }

    const bottomButton = scrolledToBottom ? (
        <Button variant="outline" className="m-2 cursor-pointer bg-transparent dark:bg-transparent" onClick={() => {
            generateMatchMutation.mutate(tableId);
        }}>
            <span className='text-input'>
                Generate New Match
            </span>
            <Plus className="ml-2" size={16} />
        </Button>
    ) : (
        <Button variant="outline" className="m-2 cursor-pointer bg-transparent dark:bg-transparent" onClick={
            () => {
                lastMatchRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }>
            <ChevronsDown />
        </Button>
    );

    return (
        <div className="flex flex-col w-full h-full">
            <div
                className="grow overflow-auto snap-y snap-mandatory basis-0"
                onScroll={handleScroll}
            >
                {tableMatches.map((match, index) => (
                    <MatchComponent
                        key={match.id}
                        match={match}
                        onMatchChange={onMatchChange}
                        ref={index === tableMatches.length - 1 ? lastMatchRef : undefined}
                    />
                ))}
            </div>
            {bottomButton}
        </div>
    );
}

function NotEnoughPlayersMessage() {
    return (
        <div className='flex w-full h-full items-center justify-center flex-col'>
            <AlertCircle className="mb-4 text-amber-500" size={48} />
            <div className="text-xl mb-2">Not Enough Available Players</div>
            <div className="text-sm mb-4 text-center max-w-md">
                This table is currently disabled because there are not enough available players.
                <br /><br />
                Players must finish their matches on the primary table before they can play here.
            </div>
        </div>
    );
}

export default function Matches() {
    const queryClient = useQueryClient();
    const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: fetchMatches,
    });

    const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
        queryKey: ['tables'],
        queryFn: fetchTables,
    });

    const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
        queryKey: ['players'],
        queryFn: fetchPlayers,
    });

    const { data: playerTableMap = {}, isLoading: playerTableMapLoading } = useQuery<Record<string, string>>({
        queryKey: ['playerTableMap'],
        queryFn: getPlayersCurrentlyPlaying,
    });

    const saveMatchesMutation = useMutation({
        mutationFn: saveMatches,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
            queryClient.invalidateQueries({
                queryKey: ['playerTableMap'],
            });
        },
    });

    const handleMatchChange = (updatedMatch: Match) => {
        const allMatches = matches.map(match =>
            match.id === updatedMatch.id ? updatedMatch : match
        );
        saveMatchesMutation.mutate(allMatches);
    };

    // Calculate which tables have enough available players
    const getAvailablePlayerCount = (tableId: string) => {
        const activePlayers = players.filter(player => player.active);
        const availablePlayers = activePlayers.filter(player => {
            const assignedTable = playerTableMap[player.id];
            return !assignedTable || assignedTable === tableId;
        });
        return availablePlayers.length;
    };

    if (matchesLoading || tablesLoading || playersLoading || playerTableMapLoading) return <div>Loading...</div>;
    if (matchesError) return <div>Error loading matches</div>;

    // If no tables exist yet
    if (tables.length === 0) {
        return (
            <div className='flex w-full h-full items-center justify-center flex-col'>
                <div className="text-xl mb-4">No tables found</div>
                <div className="text-sm mb-4">Go to Settings to add tables first</div>
            </div>
        );
    }

    // Get active tables
    const activeTables = tables.filter(table => table.active);
    
    if (activeTables.length === 0) {
        return (
            <div className='flex w-full h-full items-center justify-center flex-col'>
                <div className="text-xl mb-4">No active tables</div>
                <div className="text-sm mb-4">Go to Settings to activate tables</div>
            </div>
        );
    }

    // Sort tables to ensure primary table is first
    const sortedTables = [...activeTables].sort((a, b) => {
        // Primary table (Table 1) should be first
        if (a.name.toLowerCase().includes('table 1') || a.name.toLowerCase().includes('primary')) return -1;
        if (b.name.toLowerCase().includes('table 1') || b.name.toLowerCase().includes('primary')) return 1;
        return 0;
    });

    const primaryTable = sortedTables[0];
    const primaryTableHasEnoughPlayers = getAvailablePlayerCount(primaryTable.id) >= 4;

    // If there's only one active table, show it directly
    if (activeTables.length === 1) {
        return (
            <TableMatches 
                tableId={primaryTable.id} 
                tableName={primaryTable.name} 
                matches={matches} 
                onMatchChange={handleMatchChange}
                isPrimaryTable={true}
            />
        );
    }

    // For multiple tables, use tabs
    return (
        <Tabs defaultValue={primaryTable.id} className="w-full h-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4">
                {sortedTables.map((table, index) => {
                    const isPrimaryTable = index === 0;
                    const hasEnoughPlayers = isPrimaryTable || 
                        (primaryTableHasEnoughPlayers && getAvailablePlayerCount(table.id) >= 4);
                    
                    return (
                        <TabsTrigger 
                            key={table.id} 
                            value={table.id}
                            className={!hasEnoughPlayers && !isPrimaryTable ? "opacity-50 pointer-events-none" : ""}
                        >
                            {table.name}
                            {!hasEnoughPlayers && !isPrimaryTable && " (Disabled)"}
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            
            {sortedTables.map((table, index) => {
                const isPrimaryTable = index === 0;
                const hasEnoughPlayers = isPrimaryTable || 
                    (primaryTableHasEnoughPlayers && getAvailablePlayerCount(table.id) >= 4);
                
                return (
                    <TabsContent key={table.id} value={table.id} className="h-[calc(100%-60px)]">
                        {hasEnoughPlayers ? (
                            <TableMatches 
                                tableId={table.id} 
                                tableName={table.name} 
                                matches={matches} 
                                onMatchChange={handleMatchChange}
                                isPrimaryTable={isPrimaryTable}
                            />
                        ) : (
                            <NotEnoughPlayersMessage />
                        )}
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}