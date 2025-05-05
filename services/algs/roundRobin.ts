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

function cmp(a: number, b: number): number {
    return a - b;
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

    // smaller is better
    function getScore(matchUp: string[]): number[] {
        const key = getMatchKey(matchUp);
        const playCount = matchesDict[key] || 0;

        return [playCount];
    }

    const players = await fetchPlayers();
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    const allMatcHUps = getAllMatchUps(activePlayers);
    shuffle(allMatcHUps);
    
    allMatcHUps.sort((a, b) => {
        const scoreA = getScore(a);
        const scoreB = getScore(b);

        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] !== scoreB[i]) {
                return cmp(scoreA[i], scoreB[i]);
            }
        }
        return 0;
    });

    const team1 = allMatcHUps[0].slice(0, 2);
    const team2 = allMatcHUps[0].slice(2, 4);

    return new Match(team1, team2, activePlayers);
}