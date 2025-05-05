export function shuffle<T>(array: T[]): T[] {
    // Fisher-Yates shuffle algorithm
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function weightedShuffle(arr: { value: unknown, weight: number }[]) {
    for (let i = 0; i < arr.length; i++) {
        const v = weightedIndexChoice(arr.slice(i));
        [arr[i + v], arr[i]] = [arr[i], arr[i + v]];
    }
}

function weightedIndexChoice(arr: { value: unknown, weight: number }[]): number {
    const totalWeight = arr.map(v => v.weight).reduce((x, y) => x + y);
    const val = Math.random() * totalWeight;
    for (let i = 0, cur = 0; ; i++) {
        cur += arr[i].weight;
        if (val <= cur) return i;
    }
}

export function getAllMatchUps<T>(items: T[]): T[][] {
    const matchUps: T[][] = [];
    const n = items.length;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = 0; k < n; k++) {
                for (let l = k + 1; l < n; l++) {
                    if (i !== j && i !== k && i !== l && j !== k && j !== l && k !== l) {
                        matchUps.push([items[i], items[j], items[k], items[l]]);
                    }
                }
            }
        }
    }

    return matchUps;
}