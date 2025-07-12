"use client";

import { useEffect, useState } from 'react';
import { PlayerRanking } from '@/models/playerRanking';
import { Player } from '@/models/player';
import { calculateRankings } from '@/services/rankingService';
import { fetchPlayers } from '@/services/playerService';
import { Match } from '@/models/match';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { RankBadge } from "@/components/rank-badge";

interface PlayerRankingTableProps {
  matches: Match[];
}

export function PlayerRankingTable({ matches }: PlayerRankingTableProps) {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const rankingsData = await calculateRankings(matches);
        const playersData = await fetchPlayers();
        
        // Create a map of player IDs to player objects for easy lookup
        const playerMap: Record<string, Player> = {};
        playersData.forEach(player => {
          playerMap[player.id] = player;
        });
        
        setRankings(rankingsData);
        setPlayers(playerMap);
      } catch (error) {
        console.error("Error loading ranking data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [matches]);

  // Format win rate as percentage
  const formatWinRate = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Get rank badge based on position
  const getRankBadge = (index: number) => {
    return <RankBadge position={index + 1} />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading rankings...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Matches</TableHead>
              <TableHead className="text-right">W</TableHead>
              <TableHead className="text-right">L</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((ranking, index) => (
              <TableRow key={ranking.playerId}>
                <TableCell>{getRankBadge(index)}</TableCell>
                <TableCell className="font-medium">
                  {players[ranking.playerId]?.name || "Unknown Player"}
                </TableCell>
                <TableCell className="text-right">{ranking.matchesPlayed}</TableCell>
                <TableCell className="text-right">{ranking.wins}</TableCell>
                <TableCell className="text-right">{ranking.losses}</TableCell>
                <TableCell className="text-right">{formatWinRate(ranking.winRate)}</TableCell>
                <TableCell className="text-right font-bold">{ranking.score}</TableCell>
              </TableRow>
            ))}
            {rankings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No ranking data available. Play some matches to see rankings!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
