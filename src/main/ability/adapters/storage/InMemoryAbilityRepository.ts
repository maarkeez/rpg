import { type Ability, type AbilityRepository } from '../../domain';

export class InMemoryAbilityRepository implements AbilityRepository {
  readonly #abilities = new Map<string, Ability>();

  async create(ability: Ability): Promise<void> {
    this.#abilities.set(ability.id, ability);
  }

  async searchById(id: string): Promise<Ability | null> {
    return this.#abilities.get(id) ?? null;
  }
}
