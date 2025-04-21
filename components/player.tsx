import { Player } from "@/models/player";
import { Toggle } from "@/components/ui/toggle"
import { EditPlayerDialog } from "@/components/edit-player-dialog";

export function PlayerComponent({ player, onPlayerChange }: { player: Player, onPlayerChange?: (player: Player) => void }) {
    const onPressedChange = (pressed: boolean) => {
        player.active = pressed;
        if (onPlayerChange) {
            onPlayerChange(player);
        }
    };

    return <div className="inline-flex items-center">
        <Toggle onPressedChange={onPressedChange} pressed={player.active} variant="outline" className="h-16 w-32 ml-2 my-2 rounded-r-none cursor-pointer">
            <span>{player.name}</span>
        </Toggle>
        <EditPlayerDialog player={player} onPlayerChange={onPlayerChange} />
    </div>;
}