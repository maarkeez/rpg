import { type Effect, type EffectRepository } from '../../domain';

export class InMemoryEffectRepository implements EffectRepository {
  readonly #effects = new Map<string, Effect>();

  async create(effect: Effect): Promise<void> {
    this.#effects.set(effect.id, effect);
  }

  async searchById(id: string): Promise<Effect | null> {
    return this.#effects.get(id) ?? null;
  }
}
