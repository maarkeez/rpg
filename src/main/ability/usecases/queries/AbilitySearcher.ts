import { type AbilityDTO, type AbilityRepository } from '../../domain';

export class AbilitySearcher {
  constructor(readonly abilityRepository: AbilityRepository) {}

  async searchById(id: string): Promise<AbilityDTO | null> {
    return (await this.abilityRepository.searchById(id))?.toDto() ?? null;
  }
}
