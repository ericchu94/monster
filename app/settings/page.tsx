'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery
import { clearPlayers } from '@/services/playerService';
import { clearMatches } from '@/services/matchService';
import { updateMatchAlgorithm, fetchMatchAlgorithm } from '@/services/matchAlgorithmService'; // Import fetchMatchAlgorithm
import { MatchAlgorithm } from '@/models/matchAlgorithm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table } from '@/models/table';
import { fetchTables, saveTable, deleteTable, clearTables } from '@/services/tableService';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';

export default function Settings() {
    const queryClient = useQueryClient();
    const [newTableName, setNewTableName] = useState('');

    const { data: currentAlgorithm = MatchAlgorithm.Random } = useQuery({
        queryKey: ['matchAlgorithm'], // Query key
        queryFn: fetchMatchAlgorithm, // Fetch the current algorithm
    });

    const { data: tables = [] } = useQuery({
        queryKey: ['tables'],
        queryFn: fetchTables,
    });

    const matchAlgorithmMutation = useMutation({
        mutationFn: updateMatchAlgorithm,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matchAlgorithm'],
            });
        },
    });

    const saveTableMutation = useMutation({
        mutationFn: saveTable,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tables'],
            });
            setNewTableName(''); // Clear input after adding
        },
    });

    const deleteTableMutation = useMutation({
        mutationFn: deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tables'],
            });
        },
    });

    const clearPlayersMutation = useMutation({
        mutationFn: clearPlayers,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['players'],
            });
        },
    });

    const clearMatchesMutation = useMutation({
        mutationFn: clearMatches,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['matches'],
            });
        },
    });

    const clearTablesMutation = useMutation({
        mutationFn: clearTables,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tables'],
            });
        },
    });

    const handleAddTable = () => {
        if (newTableName.trim()) {
            const newTable = new Table(newTableName.trim());
            saveTableMutation.mutate(newTable);
        }
    };

    const handleToggleTableActive = (table: Table) => {
        const updatedTable = { ...table, active: !table.active };
        saveTableMutation.mutate(updatedTable as Table);
    };

    const handleDeleteTable = (tableId: string) => {
        deleteTableMutation.mutate(tableId);
    };

    return (
        <>
            <div className='flex flex-col h-full items-center justify-center p-4'>
                <Card className="w-full max-w-md p-4 mb-4">
                    <h2 className="text-xl font-bold mb-2">Match Settings</h2>
                    <Separator className="mb-4" />
                    
                    <div className="flex items-baseline mb-4">
                        <Label htmlFor="match-algorithm" className="m-2">Match Algorithm</Label>
                        <Select
                            value={currentAlgorithm} // Use the fetched algorithm
                            onValueChange={(value) => matchAlgorithmMutation.mutate(value as MatchAlgorithm)}
                        >
                            <SelectTrigger id="match-algorithm" className="w-[180px]">
                                <SelectValue placeholder="Select an algorithm" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(MatchAlgorithm).map((algorithm) => (
                                    <SelectItem key={algorithm} value={algorithm}>
                                        {algorithm}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <Card className="w-full max-w-md p-4 mb-4">
                    <h2 className="text-xl font-bold mb-2">Table Management</h2>
                    <Separator className="mb-4" />
                    
                    <div className="flex mb-4">
                        <Input
                            placeholder="New table name"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            className="mr-2"
                        />
                        <Button onClick={handleAddTable}>Add Table</Button>
                    </div>

                    {tables.length > 0 ? (
                        <div className="space-y-2">
                            {tables.map((table) => (
                                <div key={table.id} className="flex items-center justify-between p-2 border rounded">
                                    <span>{table.name}</span>
                                    <div className="flex items-center">
                                        <Toggle
                                            pressed={table.active}
                                            onPressedChange={() => handleToggleTableActive(table)}
                                            className="mr-2"
                                        >
                                            {table.active ? 'Active' : 'Inactive'}
                                        </Toggle>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleDeleteTable(table.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No tables found. Add a table to get started.</p>
                    )}
                </Card>

                <Card className="w-full max-w-md p-4">
                    <h2 className="text-xl font-bold mb-2">Data Management</h2>
                    <Separator className="mb-4" />
                    
                    <div className="flex flex-wrap justify-center">
                        <Button variant="destructive" className='cursor-pointer m-2' onClick={() => clearMatchesMutation.mutate()}>
                            Clear Matches
                        </Button>
                        <Button variant="destructive" className='cursor-pointer m-2' onClick={() => clearTablesMutation.mutate()}>
                            Clear Tables
                        </Button>
                        <Button variant="destructive" className='cursor-pointer m-2' onClick={() => {
                            clearMatchesMutation.mutate();
                            clearPlayersMutation.mutate();
                            clearTablesMutation.mutate();
                        }}>
                            Clear All Data
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
}