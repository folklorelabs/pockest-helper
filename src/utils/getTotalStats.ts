export default function getTotalStats(monster?: { technic: number; speed: number; power: number; } | null): number {
  return monster ? monster.technic + monster.speed + monster.power : 0;
}
