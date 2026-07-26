import { Effect, EffectAlreadyExists, type EffectRepository } from '../../domain';

export class EffectCreator {
  constructor(readonly effectRepository: EffectRepository) {}

  async create(
    id: string,
    type: string,
    duration: number,
    power: number,
    probability: number,
  ): Promise<void> {
    const existing = await this.effectRepository.searchById(id);
    if (existing) throw new EffectAlreadyExists();

    const effect = Effect.create(id, type, duration, power, probability);
    await this.effectRepository.create(effect);
  }
}
