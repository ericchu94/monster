import { Player } from './player';

export enum MatchResult {
    NotPlayed = 'NotPlayed', // Default state for matches not played
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
    Draw = 'Draw',
}

export type Match = {
    id: string;
    team1: string[]; // Store player IDs instead of Player objects
    team2: string[]; // Store player IDs instead of Player objects
    result: MatchResult;
    createdAt: string; // Add created timestamp
};
