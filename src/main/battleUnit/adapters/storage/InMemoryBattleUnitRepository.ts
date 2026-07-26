import { positionsEqual, type BattleUnit, type BattleUnitRepository, type Position } from '../../domain';

export class InMemoryBattleUnitRepository implements BattleUnitRepository {
  readonly #battleUnits = new Map<string, BattleUnit>();

  async create(battleUnit: BattleUnit): Promise<void> {
    this.#battleUnits.set(battleUnit.id, battleUnit);
  }

  async update(battleUnit: BattleUnit): Promise<void> {
    this.#battleUnits.set(battleUnit.id, battleUnit);
  }

  async searchById(id: string): Promise<BattleUnit | null> {
    return this.#battleUnits.get(id) ?? null;
  }

  async searchByPosition(position: Position): Promise<BattleUnit | null> {
    for (const battleUnit of this.#battleUnits.values()) {
      if (!battleUnit.isDefeated && positionsEqual(battleUnit.position, position)) return battleUnit;
    }
    return null;
  }

  async searchByPlayerId(playerId: string): Promise<BattleUnit[]> {
    return [...this.#battleUnits.values()].filter((battleUnit) => battleUnit.playerId === playerId);
  }

  async searchAll(): Promise<BattleUnit[]> {
    return [...this.#battleUnits.values()];
  }
}
