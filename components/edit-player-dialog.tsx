import { useState } from "react";
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

    const button = mode === "edit" ? (
        <Button variant="outline" className="h-16 w-16 my-2 rounded-l-none cursor-pointer border-l-0">
            <Edit />
        </Button>
    ) : (
        <Button variant="outline" className="mx-2">
            <Plus />
        </Button>
    );

    const title = mode === "edit" ? "Edit Player" : "Create Player";

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const name = formData.get("name") as string;
        if (onPlayerChange) {
            console.log("onPlayerChange", player, name, { ...player, name });
            onPlayerChange({ ...player, name });
        }
        setOpen(false);
    };

    return <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>{button}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <Input
                        type="text"
                        name="name"
                        defaultValue={player.name}
                        placeholder="Name"
                        className="mb-4"
                    />
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>;
}