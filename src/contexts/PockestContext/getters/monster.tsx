import PockestState from "../types/PockestState";

export function getMonsterById(state: PockestState, monsterId: number) {
    if (typeof monsterId !== 'number') return null;
    const monster = state.allMonsters.find((m) => monsterId && m.monster_id === monsterId);
    return monster;
}