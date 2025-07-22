'use client';

import { MatchResult, Match } from "@/models/match";
import { fetchMatches } from "@/services/matchService";
import { fetchPlayers } from "@/services/playerService";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

class PlayerStatistics {
    playerId: string = "";
    playCount: number = 0;
    restCount: number = 0;
    deviation: number = 0;
}

class MatchStatistics {
    match: Match;
    playerStatistics: PlayerStatistics[];

    constructor(match: Match, playerStatistics: PlayerStatistics[]) {
        this.match = match;
        this.playerStatistics = playerStatistics;
    }
}


function computeStatistics(matches: Match[]): MatchStatistics[] {
    const matchStatistics: MatchStatistics[] = [];

    const playerStatsMap: { [key: string]: PlayerStatistics } = {};

    for (const match of matches) {
        for (const playerId of match.activePlayers) {
            if (!playerStatsMap[playerId]) {
                playerStatsMap[playerId] = new PlayerStatistics();
                playerStatsMap[playerId].playerId = playerId;
                playerStatsMap[playerId].playCount = 0;
                playerStatsMap[playerId].restCount = 0;
                playerStatsMap[playerId].deviation = 0;
            }
        }

        for (const playerId of match.team1) {
            playerStatsMap[playerId].playCount++;
            playerStatsMap[playerId].restCount--; // This will get incremented later for active players 
            playerStatsMap[playerId].deviation++;
        }

        for (const playerId of match.team2) {
            playerStatsMap[playerId].playCount++;
            playerStatsMap[playerId].restCount--; // This will get incremented later for active players 
            playerStatsMap[playerId].deviation++;
        }

        for (const activePlayer of match.activePlayers) {
            playerStatsMap[activePlayer].restCount++;
            playerStatsMap[activePlayer].deviation -= 4 / match.activePlayers.length; // Expected play count
        }

        // Deep copy playerStatsMap values
        const activePlayerStatistics = match.activePlayers.map(playerId => {
            const stats = playerStatsMap[playerId];
            return { ...stats }; // Shallow copy to avoid reference issues
        });
        const matchStat = new MatchStatistics(match, activePlayerStatistics);
        matchStatistics.push(matchStat);
    }

    return matchStatistics
}

// Utility to get color for deviation
function getDeviationColor(deviation: number) {
    // Clamp deviation to [-1.5, 1.5] for color scale
    const min = -1.5, max = 1.5;
    const clamped = Math.max(min, Math.min(max, deviation));
    // Interpolate between red (-1.5), green (0), red (1.5)
    // -1.5: #ef4444 (red-500), 0: #22c55e (green-500), 1.5: #ef4444 (red-500)
    if (clamped === 0) return '#22c55e';
    // Linear interpolation between red and green
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    if (clamped < 0) {
        // -1.5 to 0: red to green
        const t = (clamped + 1.5) / 1.5; // 0 to 1
        const r = Math.round(lerp(239, 34, t));
        const g = Math.round(lerp(68, 197, t));
        const b = Math.round(lerp(68, 94, t));
        return `rgb(${r},${g},${b})`;
    } else {
        // 0 to 1.5: green to red
        const t = clamped / 1.5; // 0 to 1
        const r = Math.round(lerp(34, 239, t));
        const g = Math.round(lerp(197, 68, t));
        const b = Math.round(lerp(94, 68, t));
        return `rgb(${r},${g},${b})`;
    }
}

export default function HistoryPage() {
    const { data: matches } = useQuery({
        queryKey: ["matches"],
        queryFn: fetchMatches,
    });

    const { data: players } = useQuery({
        queryKey: ["players"],
        queryFn: fetchPlayers,
    });

    if (!matches || !players) {
        // Table skeleton loading
        return (
            <main className="p-6">
                <h1 className="text-2xl font-bold mb-4">History</h1>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Match</TableHead>
                                {[...Array(5)].map((_, i) => (
                                    <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    {[...Array(5)].map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-12" /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </main>
        );
    }

    const playedMatches = matches.filter((m, i) => m.result !== MatchResult.NotPlayed || i == matches.length - 1);

    const matchStatistics = computeStatistics(playedMatches);

    const allPlayerIds = new Set(playedMatches.flatMap(m => m.activePlayers));
    const sortedPlayers = players.filter(p => allPlayerIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">History</h1>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Match</TableHead>
                            {sortedPlayers.map((player) => (
                                <TableHead key={player.id}>{player.name}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matchStatistics.map((matchStatistics) => {
                            const match = matchStatistics.match;
                            // Prepare team names
                            const team1Names = match.team1.map(pid => players.find(p => p.id === pid)?.name).join(", ");
                            const team2Names = match.team2.map(pid => players.find(p => p.id === pid)?.name).join(", ");
                            let matchLabel;
                            if (match.result === MatchResult.Team1Win) {
                                matchLabel = <span><b>{team1Names}</b> vs {team2Names}</span>;
                            } else if (match.result === MatchResult.Team2Win) {
                                matchLabel = <span>{team1Names} vs <b>{team2Names}</b></span>;
                            } else {
                                matchLabel = <span>{team1Names} vs {team2Names}</span>;
                            }
                            return (
                                <TableRow key={match.id}>
                                    <TableCell>{matchLabel}</TableCell>
                                    {sortedPlayers.map((player) => {
                                        const stats = matchStatistics.playerStatistics.find(ps => ps.playerId === player.id);

                                        if (!stats) {
                                            return (
                                                <TableCell key={player.id}>
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell key={player.id} style={{ background: getDeviationColor(stats.deviation), color: '#fff' }}>
                                                <div className="flex flex-col text-xs">
                                                    {match.team1.includes(player.id) || match.team2.includes(player.id) ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                                    <span>Dev: {Number(stats.deviation).toFixed(1)}</span>
                                                    <span>Play: {stats.playCount}</span>
                                                    <span>Rest: {stats.restCount}</span>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
}
