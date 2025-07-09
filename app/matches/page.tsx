'use client';

import { Match, MatchResult } from '@/models/match';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Play, ChevronsDown, AlertCircle } from 'lucide-react';
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

    // Filter out empty strings (dummy players) and get player objects
    const teamPlayers = players?.filter((player: Player) => team.includes(player.id)) || [];

    // Check if this team has a dummy player (empty string in the team array)
    const hasDummyPlayer = team.includes('');

    return (
        <Toggle pressed={winner} variant="outline" className="self-stretch basis-0 h-auto grow flex flex-col items-center justify-center cursor-pointer border rounded-md m-2 p-2 bg-input/20" onPressedChange={onPressedChange}>
            {teamPlayers.map(player => (
                <div key={player.id} className='text-4xl'>{player.name}</div>
            ))}
            {hasDummyPlayer && (
                <div className='text-4xl text-gray-400 italic'>Empty Slot</div>
            )}
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

function TableMatches({ tableId, tableName, matches, onMatchChange, generateMatchMutation }: {
    tableId: string,
    tableName: string,
    matches: Match[],
    onMatchChange: (match: Match) => void,
    isPrimaryTable: boolean,
    generateMatchMutation: ({ mutate: (tableId: string) => void }),
}) {
    const lastMatchRef = useRef<HTMLDivElement | null>(null);
    const [scrolledToBottom, setScrolledToBottom] = useState(true);

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

    const bottomButton = !scrolledToBottom ? (
        <Button variant="outline" className="m-2 cursor-pointer bg-transparent dark:bg-transparent" onClick={
            () => {
                lastMatchRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }>
            <ChevronsDown />
        </Button>
    ) : null;

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

function NotEnoughPlayersMessage({ isPrimaryTable, previousTableName }: { isPrimaryTable: boolean, previousTableName?: string }) {
    return (
        <div className='flex w-full h-full items-center justify-center flex-col'>
            <AlertCircle className="mb-4 text-amber-500" size={48} />
            <div className="text-xl mb-2">Not Enough Available Players</div>
            <div className="text-sm mb-4 text-center max-w-md">
                {isPrimaryTable ? (
                    <>
                        This table is currently disabled because there are not enough available players.
                        <br /><br />
                        Please make sure you have at least 4 active players.
                    </>
                ) : previousTableName ? (
                    <>
                        There are not enough players to fill this table after the match has finished.
                        <br /><br />
                        Please go back to <strong>{previousTableName}</strong> for the next match.
                    </>
                ) : (
                    <>
                        This table is currently disabled because there are not enough available players.
                        <br /><br />
                        Players must finish their matches on the primary table before they can play here.
                    </>
                )}
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

    const generateMatchMutation = useMutation({
        mutationFn: (tableId: string) => generateMatch(tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
        },
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

        // Save the updated match
        saveMatchesMutation.mutate(allMatches, {
            onSuccess: () => {
                // If a winner was selected (match is completed), automatically generate a new match
                if (updatedMatch.result === MatchResult.Team1Win || updatedMatch.result === MatchResult.Team2Win) {
                    console.log('Match completed, preparing to generate new match');

                    // Force refetch all data to ensure we have the latest state
                    Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['matches'] }),
                        queryClient.invalidateQueries({ queryKey: ['players'] }),
                        queryClient.invalidateQueries({ queryKey: ['playerTableMap'] }),
                        queryClient.invalidateQueries({ queryKey: ['tables'] })
                    ]).then(() => {
                        // Use a longer timeout to ensure all queries have completed
                        setTimeout(() => {
                            console.log('Generating new match after winner selection');
                            generateMatchMutation.mutate(updatedMatch.tableId);
                        }, 300);
                    });
                }
            }
        });
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

    // Check if a table has an active match
    const hasActiveMatch = (tableId: string) => {
        return matches.some(match =>
            match.tableId === tableId &&
            match.result === MatchResult.NotPlayed
        );
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
                generateMatchMutation={generateMatchMutation}
            />
        );
    }

    // For multiple tables, use tabs
    return (
        <Tabs defaultValue={primaryTable.id} className="w-full h-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4">
                {sortedTables.map((table, index) => {
                    const isPrimaryTable = index === 0;
                    // Only disable a table if:
                    // 1. It's not the primary table AND
                    // 2. It doesn't have an active match AND
                    // 3. Either the primary table doesn't have enough players OR this table doesn't have enough players
                    const tableHasActiveMatch = hasActiveMatch(table.id);
                    const shouldDisable = !isPrimaryTable &&
                        !tableHasActiveMatch &&
                        (!primaryTableHasEnoughPlayers || getAvailablePlayerCount(table.id) < 4);

                    return (
                        <TabsTrigger
                            key={table.id}
                            value={table.id}
                            className={shouldDisable ? "opacity-50 pointer-events-none" : ""}
                        >
                            {table.name}
                            {shouldDisable && " (Disabled)"}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            {sortedTables.map((table, index) => {
                const isPrimaryTable = index === 0;
                const tableHasActiveMatch = hasActiveMatch(table.id);
                const shouldDisable = !isPrimaryTable &&
                    !tableHasActiveMatch &&
                    (!primaryTableHasEnoughPlayers || getAvailablePlayerCount(table.id) < 4);

                // Get the previous table name for the message
                const previousTableName = index > 0 ? sortedTables[index - 1].name : undefined;

                // Check if this table had a match that just finished
                const hasFinishedMatch = matches.some(match =>
                    match.tableId === table.id &&
                    (match.result === MatchResult.Team1Win || match.result === MatchResult.Team2Win)
                );

                return (
                    <TabsContent key={table.id} value={table.id} className="h-[calc(100%-60px)]">
                        {!shouldDisable ? (
                            <TableMatches
                                tableId={table.id}
                                tableName={table.name}
                                matches={matches}
                                onMatchChange={handleMatchChange}
                                isPrimaryTable={isPrimaryTable}
                                generateMatchMutation={generateMatchMutation}
                            />
                        ) : (
                            <NotEnoughPlayersMessage
                                isPrimaryTable={isPrimaryTable}
                                previousTableName={hasFinishedMatch ? previousTableName : undefined}
                            />
                        )}
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}