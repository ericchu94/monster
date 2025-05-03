export function updateMatchAlgorithm(newAlgorithm: string): Promise<string> {
    localStorage.setItem('matchAlgorithm', newAlgorithm); // Write to localStorage
    return Promise.resolve(newAlgorithm);
}
