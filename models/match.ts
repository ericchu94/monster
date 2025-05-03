import { v4 as uuidv4 } from 'uuid';

export enum MatchResult {
    NotPlayed = 'NotPlayed', // Default state for matches not played
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
    Draw = 'Draw',
}

export class Match {
    id: string;
    team1: string[];
    team2: string[];
    result: MatchResult;
    createdAt: string;

    constructor(team1: string[], team2: string[]) {
        this.id = uuidv4();
        this.team1 = team1;
        this.team2 = team2;
        this.result = MatchResult.NotPlayed;
        this.createdAt = new Date().toISOString();
    }
}
