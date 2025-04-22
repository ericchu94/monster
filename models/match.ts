import { Player } from './player';

export enum MatchResult {
    NotPlayed = 'NotPlayed', // Default state for matches not played
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
    Draw = 'Draw',
}

export type Match = {
    id: string;
    team1: Player[];
    team2: Player[];
    result: MatchResult; // Use enum for result
    createdAt: string; // Add created timestamp
};
