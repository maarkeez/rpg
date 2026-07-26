import {
  BattleUnit,
  BattleUnitAbilityOnCooldown,
  BattleUnitInvalidTargets,
  BattleUnitNotEnoughMana,
  BattleUnitNotFound,
  BattleUnitTargetNotDeployed,
  BattleUnitUnknownAbility,
  manhattanDistance,
  type BattleUnitRepository,
} from '../../domain';
import { TargetPattern, type AbilityRepository } from '../../../ability/domain';
import { type EffectRepository } from '../../../effect/domain';

function targetsMatchPattern(caster: BattleUnit, targets: BattleUnit[], pattern: TargetPattern): boolean {
  if (pattern === TargetPattern.Self) {
    return targets.length === 1 && targets[0].id === caster.id;
  }
  return targets.every(
    (target) => target.isEnemyOf(caster) && manhattanDistance(caster.position, target.position) === 1,
  );
}

export class AbilityCaster {
  constructor(
    readonly battleUnitRepository: BattleUnitRepository,
    readonly abilityRepository: AbilityRepository,
    readonly effectRepository: EffectRepository,
    readonly rng: () => number = Math.random,
  ) {}

  async cast(battleUnitId: string, abilityId: string, targetBattleUnitIds: string[]): Promise<void> {
    const caster = await this.battleUnitRepository.searchById(battleUnitId);
    if (!caster) throw new BattleUnitNotFound();

    const casterAbility = caster.findAbility(abilityId);
    if (!casterAbility) throw new BattleUnitUnknownAbility();

    const ability = await this.abilityRepository.searchById(abilityId);
    if (!ability) throw new BattleUnitUnknownAbility();

    if (casterAbility.cooldownTurnsLeft > 0) throw new BattleUnitAbilityOnCooldown();
    if (caster.remainingMana < ability.cost) throw new BattleUnitNotEnoughMana();

    const targets: BattleUnit[] = [];
    for (const targetId of targetBattleUnitIds) {
      const target = await this.battleUnitRepository.searchById(targetId);
      if (!target) throw new BattleUnitTargetNotDeployed();
      targets.push(target);
    }

    if (!targetsMatchPattern(caster, targets, ability.targetPattern)) {
      throw new BattleUnitInvalidTargets();
    }

    caster.payAbilityCost(abilityId, ability.cost, ability.cooldown);

    for (const target of targets) {
      for (const effectId of ability.effectIds) {
        const effect = await this.effectRepository.searchById(effectId);
        if (!effect) continue;
        if (this.rng() * 100 < effect.probability) {
          target.receiveEffect(effect.type, effect.power);
        }
      }
      await this.battleUnitRepository.update(target);
    }

    await this.battleUnitRepository.update(caster);
  }
}
