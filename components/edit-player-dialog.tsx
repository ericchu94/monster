import { useState } from "react";
import { Player } from "@/models/player";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";

export function EditPlayerDialog({ 
    player, 
    onPlayerChange, 
    mode = "edit" 
}: { 
    player: Player, 
    onPlayerChange?: (player: Player) => void, 
    mode?: "edit" | "create" 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(mode === "edit" ? player.name : "");

    const onSave = () => {
        const updatedPlayer = { ...player, name };
        if (onPlayerChange) {
            onPlayerChange(updatedPlayer);
        }
        setIsOpen(false);
    };

    const button = mode === "edit" ? (
        <Button onClick={() => setIsOpen(true)} variant="outline" className="h-16 w-16 my-2 rounded-l-none cursor-pointer border-l-0">
            <Edit />
        </Button>
    ) : (
        <Button onClick={() => setIsOpen(true)} variant="outline" className="mx-2">
            <Plus />
        </Button>
    );

    return <>
        {button}
        {isOpen && <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow">
                <h2>{mode === "edit" ? "Edit Player" : "Create Player"}</h2>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full" />
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setIsOpen(false)} variant="secondary" className="mr-2">Cancel</Button>
                    <Button onClick={onSave}>{mode === "edit" ? "Save" : "Create"}</Button>
                </div>
            </div>
        </div>}
    </>;
}