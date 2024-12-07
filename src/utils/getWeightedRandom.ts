export default function getWeightedRandom(weights: number[]): number {
  const totalWeight = weights.reduce((sum, x) => sum + x, 0);
  const randomNumber = Math.floor(Math.random() * totalWeight);
  let tally = weights[0];
  let weightedIndex = 0;
  while (randomNumber > tally) {
    weightedIndex += 1;
    tally += weights[weightedIndex];
  }
  return weightedIndex;
}
