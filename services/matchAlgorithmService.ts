import { MatchAlgorithm } from "../models/matchAlgorithm"; // Import the enum

export function updateMatchAlgorithm(newAlgorithm: MatchAlgorithm): Promise<MatchAlgorithm> {
    localStorage.setItem('matchAlgorithm', newAlgorithm); // Write to localStorage
    return Promise.resolve(newAlgorithm);
}

export function fetchMatchAlgorithm(): Promise<MatchAlgorithm> {
    return Promise.resolve(
        (localStorage.getItem('matchAlgorithm') as MatchAlgorithm) || MatchAlgorithm.Random // Default to enum value
    );
}
