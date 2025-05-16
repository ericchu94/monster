import { PlayerRankingTable } from "@/components/player-ranking-table";

export default function RankingsPage() {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Player Rankings</h1>
        <PlayerRankingTable />
      </div>
    );
  }