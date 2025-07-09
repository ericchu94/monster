import { Match, MatchResult } from "@/models/match";
import { fetchPlayers } from "../playerService";
import { fetchMatches } from "../matchService";
import { get } from "http";
import { getAllMatchUps, shuffle } from "./utils";

function combine(n: number, k: number): number[][] {
    const results: number[][] = [];
    function backtrack(start: number, path: number[]) {
        if (path.length === k) {
            results.push([...path]);
            return;
        }
        for (let i = start; i < n; i++) {
            path.push(i);
            backtrack(i + 1, path);
            path.pop();
        }
    }
    backtrack(0, []);
    return results;
}




function restSequence(n: number): number[][] {
    const combinations = combine(n, n - 4);
    console.log("Combinations:", combinations);

    const occurenceCountDict: Record<number, number> = {};
    const mostRecentOccuranceDict: Record<number, number> = {};

    for (let i = 1; i <= n; i++) {
        occurenceCountDict[i] = 0;
        mostRecentOccuranceDict[i] = -1; // Initialize with -1 to indicate not seen yet
    }

    function getScore(combo: number[]): number[] {
        const occurence = combo.reduce((acc, playerId) => acc + occurenceCountDict[playerId], 0);
        const mostRecent = combo.reduce((acc, playerId) => acc + mostRecentOccuranceDict[playerId], 0);
        return [occurence, mostRecent];
    }

    const sequence: number[][] = [];

    while (combinations.length > 0) {
        combinations.sort((a, b) => {
            const scoreA = getScore(a);
            const scoreB = getScore(b);
            return scoreA[0] - scoreB[0] || scoreA[1] - scoreB[1];
        });

        const next = combinations.shift()!;
        // console.log("Next combination:", next);

        for (const playerId of next) {
            occurenceCountDict[playerId]++;
            mostRecentOccuranceDict[playerId] = sequence.length; // Update most recent occurrence
        }

        sequence.push(next);
    }

    return sequence;
}

function setsAreEqual<T>(setA: Set<T>, setB: Set<T>): boolean {
    if (setA.size !== setB.size) return false;
    for (let elem of setA) {
        if (!setB.has(elem)) return false;
    }
    return true;
}

// Example usage:
const set1 = new Set([1, 2, 3]);
const set2 = new Set([3, 2, 1]);
const set3 = new Set([1, 2, 4]);

console.log(setsAreEqual(set1, set2)); // true
console.log(setsAreEqual(set1, set3)); // false


export async function restingQueue(tableId: string, playerTableMap: Record<string, string> = {}): Promise<Match | null> {
    const players = await fetchPlayers();
    
    // Filter out players who are currently playing on other tables
    const availablePlayers = players.filter((player) => {
        if (!player.active) return false;
        
        // If player is assigned to a table and it's not this table, they're unavailable
        const assignedTable = playerTableMap[player.id];
        return !assignedTable || assignedTable === tableId;
    }).map(p => p.id);

    if (availablePlayers.length < 4) {
        // Log warning instead of showing an alert
        console.warn(`Not enough available players to create a match on this table. Some players may be playing on other tables.`);
        return null;
    }

    console.log("Available players:", availablePlayers);

    const matches = await fetchMatches();
    const playedMatches = matches.filter(m => m.result !== MatchResult.NotPlayed);

    // Chop of matches with these active players, consecutively from the end
    const idx = playedMatches.findLastIndex(m => !setsAreEqual(new Set(m.activePlayers), new Set(availablePlayers)));

    const beforeMatches = playedMatches.slice(0, idx + 1);

    const deviationMap: Record<string, number> = {};
    const recencyMap: Record<string, number> = {};
    const neverPlayedMap: Record<string, number> = {};

    for (const playerId of availablePlayers) {
        deviationMap[playerId] = 0;
        recencyMap[playerId] = -1; // Initialize with -1 to indicate not seen yet
        neverPlayedMap[playerId] = 0; // Assume they have never played
    }

    // Before matches is used to calculate rest bias
    for (let i = 0; i < beforeMatches.length; i++) {
        const match = beforeMatches[i];

        match.team1.forEach(playerId => {
            deviationMap[playerId] += 1;
            recencyMap[playerId] = i; // Update most recent occurrence
            neverPlayedMap[playerId] = 1; // They have played

        });
        match.team2.forEach(playerId => {
            deviationMap[playerId] += 1;
            recencyMap[playerId] = i; // Update most recent occurrence
            neverPlayedMap[playerId] = 1; // They have played
        });

        for (const playerId of match.activePlayers) {
            deviationMap[playerId] -= 4 / match.activePlayers.length; // Expected play count
        }
    }

    function getScore(playerId: string): number[] {
        const deviation = deviationMap[playerId];
        const recency = recencyMap[playerId];
        const neverPlayed = neverPlayedMap[playerId];
        return [neverPlayed, deviation, recency];
    }

    availablePlayers.sort((a, b) => {
        const scoreA = getScore(a);
        const scoreB = getScore(b);

        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] !== scoreB[i]) {
                return scoreA[i] - scoreB[i];
            }
        }
        return 0;
    });
    availablePlayers.reverse()

    for (const playerId of availablePlayers) {
        const name = players.find(p => p.id === playerId)?.name || "Unknown Player";
        console.log(`Player ${name} - Score: ${getScore(playerId).join(", ")}`);
    }

    const rests = restSequence(availablePlayers.length);

    console.log("Rest sequences:", rests);

    const offset = (playedMatches.length - idx - 1);

    console.log("Offset for rest sequence:", offset);

    const nextRest = rests[(offset) % rests.length];

    console.log("Next rest sequence:", nextRest);

    const chosenPlayers = availablePlayers.filter((_, index) => !nextRest.includes(index));

    console.log("Chosen players for the match:", chosenPlayers);

    // Now we need to find the right matchup for the chosen players
    function getMatchKey(matchUp: string[]): string {
        const team1 = getTeamKey(matchUp.slice(0, 2));
        const team2 = getTeamKey(matchUp.slice(2, 4));

        const key = [team1, team2].sort().join(",");

        return key;
    }

    function getTeamKey(team: string[]): string {
        return team.sort().join(",");
    }

    const matchupPlayCount: Record<string, number> = {};
    const matchupRecencyMap: Record<string, number> = {};
    const teamRecencyMap: Record<string, number> = {};

    for (let i = 0; i < playedMatches.length; i++) {
        const match = playedMatches[i];
        const key = getMatchKey(match.team1.concat(match.team2));
        matchupRecencyMap[key] = i; // Store the most recent occurrence of this matchup
        teamRecencyMap[getTeamKey(match.team1)] = i; // Store the most recent occurrence of team1
        teamRecencyMap[getTeamKey(match.team2)] = i; // Store the most recent occurrence of team1
        matchupPlayCount[key] = (matchupPlayCount[key] || 0) + 1; // Count how many times this matchup has been played
    }

    function getMatchupScore(matchUp: string[]): number[] {
        const key = getMatchKey(matchUp);
        const recency = matchupRecencyMap[key] || -1; // -1 if never played
        const team1Key = getTeamKey(matchUp.slice(0, 2));
        const team2Key = getTeamKey(matchUp.slice(2, 4));
        const team1Recency = teamRecencyMap[team1Key] ?? -1; // -1 if never played
        const team2Recency = teamRecencyMap[team2Key] ?? -1; // -1 if never played
        const playCount = matchupPlayCount[key] || 0; // 0 if never played

        return [playCount, recency, team1Recency + team2Recency];
    }

    const possibleMatchups = getAllMatchUps(chosenPlayers);
    console.log("Possible matchups:", possibleMatchups);

    possibleMatchups.sort((a, b) => {
        const scoreA = getMatchupScore(a);
        const scoreB = getMatchupScore(b);

        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] !== scoreB[i]) {
                return scoreA[i] - scoreB[i];
            }
        }
        return 0;
    });

    for (const matchup of possibleMatchups) {
        const playerNames = matchup.map(id => players.find(p => p.id === id)?.name || "Unknown Player");
        console.log(`Matchup: ${playerNames[0]} & ${playerNames[1]} vs ${playerNames[2]} & ${playerNames[3]} - Score: ${getMatchupScore(matchup).join(", ")}`);
    }

    const chosenMatchup = possibleMatchups[0];

    console.log("Chosen matchup:", chosenMatchup);

    const team1 = shuffle(chosenMatchup.slice(0, 2));
    const team2 = shuffle(chosenMatchup.slice(2, 4));
    const teams = shuffle([team1, team2]);

    // Get all active players for the activePlayers field (used for tracking expected play counts)
    const activePlayers = players.filter((player) => player.active).map((player) => player.id);

    return new Match(teams[0], teams[1], activePlayers, tableId);
}