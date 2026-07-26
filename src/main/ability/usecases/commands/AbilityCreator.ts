import { Ability, AbilityAlreadyExists, AbilityEffectNotFound, type AbilityRepository } from '../../domain';
import { type EffectRepository } from '../../../effect/domain';

export class AbilityCreator {
  constructor(
    readonly abilityRepository: AbilityRepository,
    readonly effectRepository: EffectRepository,
  ) {}

  async create(
    id: string,
    name: string,
    cost: number,
    cooldown: number,
    effectIds: string[],
    targetPattern: string,
  ): Promise<void> {
    const existing = await this.abilityRepository.searchById(id);
    if (existing) throw new AbilityAlreadyExists();

    for (const effectId of effectIds) {
      const effect = await this.effectRepository.searchById(effectId);
      if (!effect) throw new AbilityEffectNotFound();
    }

    const ability = Ability.create(id, name, cost, cooldown, effectIds, targetPattern);
    await this.abilityRepository.create(ability);
  }
}
