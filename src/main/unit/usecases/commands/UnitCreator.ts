import { Unit, UnitAbilityNotFound, UnitAlreadyExists, type UnitRepository } from '../../domain';
import { type AbilityRepository } from '../../../ability/domain';

export class UnitCreator {
  constructor(
    readonly unitRepository: UnitRepository,
    readonly abilityRepository: AbilityRepository,
  ) {}

  async create(
    id: string,
    name: string,
    maxHealth: number,
    maxMana: number,
    abilityIds: string[],
    movementRange: number,
  ): Promise<void> {
    const existing = await this.unitRepository.searchById(id);
    if (existing) throw new UnitAlreadyExists();

    for (const abilityId of abilityIds) {
      const ability = await this.abilityRepository.searchById(abilityId);
      if (!ability) throw new UnitAbilityNotFound();
    }

    const unit = Unit.create(id, name, maxHealth, maxMana, abilityIds, movementRange);
    await this.unitRepository.create(unit);
  }
}
