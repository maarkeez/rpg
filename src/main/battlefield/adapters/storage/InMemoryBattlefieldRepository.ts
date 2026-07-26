import { type Battlefield, type BattlefieldRepository } from '../../domain';

export class InMemoryBattlefieldRepository implements BattlefieldRepository {
  readonly #battlefields = new Map<string, Battlefield>();

  async create(battlefield: Battlefield): Promise<void> {
    this.#battlefields.set(battlefield.id, battlefield);
  }

  async update(battlefield: Battlefield): Promise<void> {
    this.#battlefields.set(battlefield.id, battlefield);
  }

  async searchById(id: string): Promise<Battlefield | null> {
    return this.#battlefields.get(id) ?? null;
  }
}
