import { Player } from "@/models/player";
import { Toggle } from "@/components/ui/toggle"

export function PlayerComponent({ player, onPressedChange }: { player: Player, onPressedChange?: (pressed: boolean) => void }) {
    return (
        <Toggle onPressedChange={onPressedChange} pressed={player.active} variant="outline" className="h-16 w-32 m-2 inline-flex justify-between items-center">
            <span>{player.name}</span>
        </Toggle>
    );
}