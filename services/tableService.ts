import { Table } from '@/models/table';

export async function fetchTables(): Promise<Table[]> {
    const tables = localStorage.getItem('tables');
    // If no tables exist yet, create a default table
    if (!tables) {
        const defaultTable = new Table('Table 1');
        await saveTables([defaultTable]);
        return [defaultTable];
    }
    return JSON.parse(tables);
}

export async function saveTable(table: Table): Promise<Table[]> {
    const tables = await fetchTables();
    const existingTableIndex = tables.findIndex(t => t.id === table.id);
    
    if (existingTableIndex >= 0) {
        tables[existingTableIndex] = table;
    } else {
        tables.push(table);
    }
    
    localStorage.setItem('tables', JSON.stringify(tables));
    return tables;
}

export async function saveTables(tables: Table[]): Promise<Table[]> {
    localStorage.setItem('tables', JSON.stringify(tables));
    return tables;
}

export async function deleteTable(tableId: string): Promise<Table[]> {
    const tables = await fetchTables();
    const updatedTables = tables.filter(table => table.id !== tableId);
    return saveTables(updatedTables);
}

export async function clearTables(): Promise<void> {
    localStorage.removeItem('tables');
}
