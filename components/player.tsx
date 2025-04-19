import { useState } from "react";
import { Player } from "@/models/player";
import { Toggle } from "@/components/ui/toggle"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



export function PlayerComponent({ player, onPlayerChange }: { player: Player, onPlayerChange?: (player: Player) => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onPressedChange = (pressed: boolean) => {
        player.active = pressed;
        if (onPlayerChange) {
            onPlayerChange(player);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const name = formData.get("name") as string;
        if (name) {
            player.name = name;
            if (onPlayerChange) {
                onPlayerChange(player);
            }
        }
        setIsDialogOpen(false);
    };

    return <div className="inline-flex items-center">
        <Toggle onPressedChange={onPressedChange} pressed={player.active} variant="outline" className="h-16 w-32 ml-2 my-2 rounded-r-none cursor-pointer">
            <span>{player.name}</span>
        </Toggle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button variant={"outline"} className="h-16 rounded-l-none mr-2 my-2 border-l-0 cursor-pointer"><Edit /></Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Player</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <Input id="name" name="name" defaultValue={player.name} />
                    <DialogFooter>
                        <Button type="submit" className="mt-2">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>;
}