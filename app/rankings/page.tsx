"use client";

import { PlayerRankingTable } from "@/components/player-ranking-table";
import { fetchMatches } from "@/services/matchService";
import { fetchSessions } from "@/services/sessionService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

export default function RankingsPage() {
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
  });
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  const globalMatches = [...(sessions?.flat() || []), ...matches];

  if (matchesLoading || sessionsLoading) {
    return <div className="flex justify-center p-8">Loading rankings...</div>;
  }
  if (matchesError || sessionsError) {
    return <div className="flex justify-center p-8 text-red-500">Error loading rankings</div>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Player Rankings</h1>
        <Tabs defaultValue="current" className="w-full">
          <TabsList>
            <TabsTrigger value="current">Current Rankings</TabsTrigger>
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <PlayerRankingTable matches={matches} />
          </TabsContent>
          <TabsContent value="global">
            <PlayerRankingTable matches={globalMatches} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}