import { Match } from "@/models/match";
import { fetchMatches } from "../matchService";
import { getAllMatchUps, shuffle } from "./utils";
import { Player } from "@/models/player";
import { fetchPlayers } from "../playerService";

function getMatchKey(matchUp: string[]): string {
    const team1 = matchUp.slice(0, 2).sort().join(",");
    const team2 = matchUp.slice(2, 4).sort().join(",");

    const key = [team1, team2].sort().join(",");

    return key;
}

export async function roundRobin(): Promise<Match> {
    const matches = await fetchMatches();
    const matchesDict: Record<string, number> = {};
    for (const match of matches) {
        const key = getMatchKey(match.team1.concat(match.team2));

        if (!matchesDict[key]) {
            matchesDict[key] = 0;
        }
        matchesDict[key] += 1;
    }

    const players = await fetchPlayers();
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    const allMatcHUps = getAllMatchUps(activePlayers);
    shuffle(allMatcHUps);
    
    allMatcHUps.sort((a, b) => {
        const keyA = getMatchKey(a);
        const keyB = getMatchKey(b);
        const countA = matchesDict[keyA] || 0;
        const countB = matchesDict[keyB] || 0;
        return countA - countB;
    });

    const team1 = allMatcHUps[0].slice(0, 2);
    const team2 = allMatcHUps[0].slice(2, 4);

    return new Match(team1, team2, activePlayers);
}