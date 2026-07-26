import { type Unit, type UnitRepository } from '../../domain';

export class InMemoryUnitRepository implements UnitRepository {
  readonly #units = new Map<string, Unit>();

  async create(unit: Unit): Promise<void> {
    this.#units.set(unit.id, unit);
  }

  async searchById(id: string): Promise<Unit | null> {
    return this.#units.get(id) ?? null;
  }
}
