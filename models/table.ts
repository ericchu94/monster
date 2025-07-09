import { v4 as uuidv4 } from 'uuid';

export class Table {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;

    constructor(name: string) {
        this.id = uuidv4();
        this.name = name;
        this.active = true;
        this.createdAt = new Date().toISOString();
    }
}
