import { type UnitDTO, type UnitRepository } from '../../domain';

export class UnitSearcher {
  constructor(readonly unitRepository: UnitRepository) {}

  async searchById(id: string): Promise<UnitDTO | null> {
    return (await this.unitRepository.searchById(id))?.toDto() ?? null;
  }
}
