import { Match } from "@/models/match";
import { MatchAlgorithm } from "@/models/matchAlgorithm";
import { randomMatch } from "./randomMatch";
import { expectedMatch } from "./expectedMatch";
import { roundRobin } from "./roundRobin";
import { roundRobinSignificance } from "./roundRobinSignificance";
import { restingQueue } from "./restingQueue";

export const MATCH_ALGORITHMS: Record<MatchAlgorithm, () => Promise<Match>> = {
    [MatchAlgorithm.Random]: randomMatch,
    [MatchAlgorithm.Expected]: expectedMatch,
    [MatchAlgorithm.RoundRobin]: roundRobin,
    [MatchAlgorithm.RoundRobinSignificance]: roundRobinSignificance,
    [MatchAlgorithm.RestingQueue]: restingQueue,
};