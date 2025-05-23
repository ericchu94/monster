import { PlayerRankingTable } from "@/components/player-ranking-table";

export default function RankingsPage() {
  return (
    <>
      <div className="flex flex-col w-full h-full">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Player Rankings</h1>
          <PlayerRankingTable />
        </div>
      </div>
    </>
  );
}