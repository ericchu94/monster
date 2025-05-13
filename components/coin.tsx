import { Pentagon, Swords } from "lucide-react";
import { useState } from "react";

export function Coin() {
    const size = 64;

    const heads = <Swords size={size} />;
    const tails = <Pentagon size={size} />;

    const [isHeads, setIsHeads] = useState(true);
    const [animate, setAnimate] = useState(false);

    const onClick = () => {
        const randomValue = Math.random();
        setIsHeads(randomValue < 0.5);
        setAnimate(true);
        setTimeout(() => {
            setAnimate(false);
        }
        , 1000);
    };

    const animateBase = 'transition-transform duration-1000 animate-'
    const animateClass = animate ? `${animateBase}${isHeads ? 'heads' : 'tails'}` : '';

    return (
        <div onClick={onClick} className={`relative cursor-pointer transform-3d ${isHeads ? 'rotate-y-0' : 'rotate-y-180'} ${animateClass}`}>
            <div className="bg-background absolute backface-hidden">
                {heads}
            </div>
            <div className="bg-background rotate-y-180 backface-hidden">
                {tails}
            </div>
        </div>
    )
}