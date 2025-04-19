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



export function PlayerComponent({ player, onPressedChange }: { player: Player, onPressedChange?: (pressed: boolean) => void }) {
    return <div className="inline-flex items-center">
        <Toggle onPressedChange={onPressedChange} pressed={player.active} variant="outline" className="h-16 w-32 ml-2 my-2 rounded-r-none cursor-pointer">
            <span>{player.name}</span>
        </Toggle>
        <Dialog>
            <DialogTrigger asChild><Button variant={"outline"} className="h-16 rounded-l-none mr-2 my-2 border-l-0 cursor-pointer"><Edit /></Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Player</DialogTitle>
                </DialogHeader>
                <Input id="name" defaultValue={player.name} className="col-span-3" />
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>;
}