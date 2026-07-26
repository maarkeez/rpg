import { type EffectDTO, type EffectRepository } from '../../domain';

export class EffectSearcher {
  constructor(readonly effectRepository: EffectRepository) {}

  async searchById(id: string): Promise<EffectDTO | null> {
    return (await this.effectRepository.searchById(id))?.toDto() ?? null;
  }
}
