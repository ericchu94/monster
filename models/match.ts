import { v4 as uuidv4 } from 'uuid';

export enum MatchResult {
    NotPlayed = 'NotPlayed', // Default state for matches not played
    Team1Win = 'Team1Win',
    Team2Win = 'Team2Win',
}

export class Match {
    id: string;
    team1: string[];
    team2: string[];
    result: MatchResult;
    createdAt: string;
    activePlayers: string[];
    tableId: string; // Added tableId to associate match with a table

    constructor(team1: string[], team2: string[], activePlayers: string[], tableId: string) {
        this.id = uuidv4();
        this.team1 = team1;
        this.team2 = team2;
        this.result = MatchResult.NotPlayed;
        this.createdAt = new Date().toISOString();
        this.activePlayers = activePlayers;
        this.tableId = tableId;
    }
}
