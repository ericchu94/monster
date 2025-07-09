import { Match, MatchResult } from "@/models/match";
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

export async function roundRobinSignificance(tableId: string, playerTableMap: Record<string, string> = {}): Promise<Match | null> {
    const matches = await fetchMatches();
    const matchesDict: Record<string, number> = {};
    const teamDict: Record<string, number> = {};
    const skippedCount: Record<string, number> = {};
    const expectedMatches: Record<string, number> = {};
    const actualMatches: Record<string, number> = {};
    for (const match of matches.filter((match: Match) => match.result !== MatchResult.NotPlayed)) {
        // number of times this match up has been played
        const key = getMatchKey(match.team1.concat(match.team2));

        if (!matchesDict[key]) {
            matchesDict[key] = 0;
        }
        matchesDict[key] += 1;

        // number of times this team has played
        const team1 = match.team1.sort().join(",");
        const team2 = match.team2.sort().join(",");
        if (!teamDict[team1]) {
            teamDict[team1] = 0;
        }
        teamDict[team1] += 1;
        if (!teamDict[team2]) {
            teamDict[team2] = 0;
        }
        teamDict[team2] += 1;

        // number of times is player has been skipped in a row
        for (const player of match.activePlayers) {
            if (!skippedCount[player]) {
                skippedCount[player] = 0;
            }
            if (match.team1.includes(player) || match.team2.includes(player)) {
                skippedCount[player] = 0;
            } else {
                skippedCount[player] += 1;
            }
        }

        // expected and actual matches
        for (const player of match.activePlayers) {
            if (!expectedMatches[player]) {
                expectedMatches[player] = 0;
            }
            expectedMatches[player] += 4 / match.activePlayers.length;

            if (!actualMatches[player]) {
                actualMatches[player] = 0;
            }
            if (match.team1.includes(player) || match.team2.includes(player)) {
                actualMatches[player] += 1;
            }
        }
    }

    // smaller is better
    function getScore(matchUp: string[]): number[] {
        const key = getMatchKey(matchUp);
        const playCount = matchesDict[key] || 0;
        const team1Count = teamDict[matchUp.slice(0, 2).sort().join(",")] || 0;
        const teamCount2 = teamDict[matchUp.slice(2, 4).sort().join(",")] || 0;

        const skippedCountSum = matchUp.reduce((sum, player) => sum + (skippedCount[player] || 0), 0);

        const expectedMatchesSum = matchUp.reduce((sum, player) => sum + (expectedMatches[player] || 0), 0);
        const actualMatchesSum = matchUp.reduce((sum, player) => sum + (actualMatches[player] || 0), 0);

        return [playCount, team1Count + teamCount2, -skippedCountSum, actualMatchesSum - expectedMatchesSum];
    }

    const players = await fetchPlayers();
    
    // Filter out players who are currently playing on other tables
    const availablePlayers = players.filter((player: Player) => {
        if (!player.active) return false;
        
        // If player is assigned to a table and it's not this table, they're unavailable
        const assignedTable = playerTableMap[player.id];
        return !assignedTable || assignedTable === tableId;
    }).map((player: Player) => player.id);

    if (availablePlayers.length < 4) {
        // Log warning instead of showing an alert
        console.warn(`Not enough available players to create a match on this table. Some players may be playing on other tables.`);
        return null;
    }

    const allMatchUps = getAllMatchUps(availablePlayers);
    shuffle(allMatchUps);
    
    allMatchUps.sort((a, b) => {
        const scoreA = getScore(a);
        const scoreB = getScore(b);

        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] !== scoreB[i]) {
                return cmp(scoreA[i], scoreB[i]);
            }
        }
        return 0;
    });

    const team1 = allMatchUps[0].slice(0, 2);
    const team2 = allMatchUps[0].slice(2, 4);
    const teams = shuffle([team1, team2]);

    // Get all active players for the activePlayers field (used for tracking expected play counts)
    const activePlayers = players.filter((player: Player) => player.active).map((player: Player) => player.id);

    return new Match(teams[0], teams[1], activePlayers, tableId);
}