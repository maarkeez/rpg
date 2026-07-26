import { type Battle, type BattleRepository } from '../../domain';

export class InMemoryBattleRepository implements BattleRepository {
  readonly #battles = new Map<string, Battle>();

  async create(battle: Battle): Promise<void> {
    this.#battles.set(battle.id, battle);
  }

  async update(battle: Battle): Promise<void> {
    this.#battles.set(battle.id, battle);
  }

  async searchById(id: string): Promise<Battle | null> {
    return this.#battles.get(id) ?? null;
  }
}
