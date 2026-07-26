import { BattleUnitNotFound, type BattleUnitRepository } from '../../domain';
import { type EffectType } from '../../../effect/domain';

export class AbilityEffectReceiver {
  constructor(readonly battleUnitRepository: BattleUnitRepository) {}

  async receive(battleUnitId: string, effectType: EffectType, power: number): Promise<void> {
    const battleUnit = await this.battleUnitRepository.searchById(battleUnitId);
    if (!battleUnit) throw new BattleUnitNotFound();

    battleUnit.receiveEffect(effectType, power);
    await this.battleUnitRepository.update(battleUnit);
  }
}
