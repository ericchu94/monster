import { useEffect, useRef, useState } from "react";
import { Player } from "@/models/player";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Fab } from "./ui/fab";

export function EditPlayerDialog({
    player,
    onPlayerChange,
    mode = "edit"
}: {
    player: Player,
    onPlayerChange?: (player: Player) => void,
    mode?: "edit" | "create"
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(player.name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when the dialog opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const button = mode === "edit" ? (
        <Button variant="outline" className="h-16 w-16 my-2 rounded-l-none cursor-pointer border-l-0">
            <Edit />
        </Button>
    ) : (
        <Fab 
            icon={<Plus size={24} />} 
            position="bottom-right"
            size="lg"
            aria-label="Add player"
        />
    );

    const title = mode === "edit" ? "Edit Player" : "Add New Player";

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const name = formData.get("name") as string;
        if (onPlayerChange && name.trim()) {
            onPlayerChange({ ...player, name });
        }
        if (mode === "edit") {
            setOpen(false);
        } else {
            setName("");
            // Keep the dialog open for adding multiple players
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const buttonText = mode === "edit" ? "Save" : "Add";

    return <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>{button}</DialogTrigger>
            <DialogContent className="top-[20%] sm:top-[30%]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <Input
                        ref={inputRef}
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Player Name"
                        className="mb-4"
                        autoComplete="off"
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={!name.trim()}>{buttonText}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>;
}