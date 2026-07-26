import { BattleNotFound, type BattleRepository } from '../../../battle/domain';
import { PlayerTurnFinisher } from '../../../battle/usecases/commands/PlayerTurnFinisher';
import { RoundStarter } from '../../../battle/usecases/commands/RoundStarter';
import { PlayerType, type PlayerRepository } from '../../../player/domain';
import {
  manhattanDistance,
  type BattleUnit,
  type BattleUnitRepository,
  type Position,
} from '../../../battleUnit/domain';
import { BattleUnitMover } from '../../../battleUnit/usecases/commands/BattleUnitMover';
import { AbilityCaster } from '../../../battleUnit/usecases/commands/AbilityCaster';
import { TargetPattern, type AbilityDTO, type AbilityRepository } from '../../../ability/domain';
import { type EffectRepository } from '../../../effect/domain';
import { type Battlefield, type BattlefieldRepository } from '../../../battlefield/domain';

type PlannedCast = {
  abilityId: string;
  targetIds: string[];
};

export class CpuTurnPlayer {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly playerRepository: PlayerRepository,
    readonly battleUnitRepository: BattleUnitRepository,
    readonly abilityRepository: AbilityRepository,
    readonly effectRepository: EffectRepository,
    readonly battlefieldRepository: BattlefieldRepository,
    readonly battlefieldId: string,
  ) {}

  async play(battleId: string): Promise<void> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    const currentPlayerId = battle.toDto().currentPlayerTurn;
    const player = await this.playerRepository.searchById(currentPlayerId);
    if (!player || player.toDto().type !== PlayerType.Cpu) return;

    const battleUnitMover = new BattleUnitMover(this.battleUnitRepository, this.battlefieldRepository, this.battlefieldId);
    const abilityCaster = new AbilityCaster(
      this.battleUnitRepository,
      this.abilityRepository,
      this.effectRepository,
      this.battlefieldRepository,
      this.battlefieldId,
    );

    const cpuBattleUnitIds = (await this.battleUnitRepository.searchByPlayerId(currentPlayerId))
      .filter((battleUnit) => !battleUnit.isDefeated)
      .map((battleUnit) => battleUnit.id);

    for (const battleUnitId of cpuBattleUnitIds) {
      const battleUnit = await this.battleUnitRepository.searchById(battleUnitId);
      if (!battleUnit || battleUnit.isDefeated) continue;

      const enemies = (await this.battleUnitRepository.searchAll()).filter(
        (other) => !other.isDefeated && other.isEnemyOf(battleUnit),
      );
      if (enemies.length === 0) continue;

      if (battleUnit.remainingMoveSteps > 0) {
        const battlefield = await this.battlefieldRepository.searchById(this.battlefieldId);
        if (battlefield) {
          const destination = this.#findMoveTowardsClosestEnemy(battleUnit, enemies, battlefield);
          if (destination) await battleUnitMover.move(battleUnitId, destination);
        }
      }

      const movedUnit = await this.battleUnitRepository.searchById(battleUnitId);
      if (!movedUnit) continue;

      const freshEnemies = (await this.battleUnitRepository.searchAll()).filter(
        (other) => !other.isDefeated && other.isEnemyOf(movedUnit),
      );
      const cast = await this.#findBestCast(movedUnit, freshEnemies);
      if (cast) await abilityCaster.cast(battleUnitId, cast.abilityId, cast.targetIds);
    }

    await new PlayerTurnFinisher(this.battleRepository, this.battleUnitRepository).finish(battleId);

    const battleAfterTurn = await this.battleRepository.searchById(battleId);
    if (battleAfterTurn?.toDto().roundFinished) {
      await new RoundStarter(this.battleRepository, this.battleUnitRepository).startNextRound(battleId);
    }
  }

  #findMoveTowardsClosestEnemy(battleUnit: BattleUnit, enemies: BattleUnit[], battlefield: Battlefield): Position | null {
    const nearestEnemy = enemies.reduce((closest, enemy) =>
      manhattanDistance(battleUnit.position, enemy.position) < manhattanDistance(battleUnit.position, closest.position)
        ? enemy
        : closest,
    );

    const currentDistance = manhattanDistance(battleUnit.position, nearestEnemy.position);
    if (currentDistance <= 1) return null;

    const { rows, cols } = battlefield.toDto();
    let bestPosition: Position | null = null;
    let bestDistanceToEnemy = currentDistance;

    for (let rowOffset = -battleUnit.remainingMoveSteps; rowOffset <= battleUnit.remainingMoveSteps; rowOffset++) {
      const remainingForCol = battleUnit.remainingMoveSteps - Math.abs(rowOffset);
      for (let colOffset = -remainingForCol; colOffset <= remainingForCol; colOffset++) {
        const candidate = { row: battleUnit.position.row + rowOffset, col: battleUnit.position.col + colOffset };
        if (candidate.row < 0 || candidate.row >= rows || candidate.col < 0 || candidate.col >= cols) continue;
        if (!battlefield.isVacant(candidate)) continue;

        const distanceToEnemy = manhattanDistance(candidate, nearestEnemy.position);
        if (distanceToEnemy < bestDistanceToEnemy) {
          bestDistanceToEnemy = distanceToEnemy;
          bestPosition = candidate;
        } else if (distanceToEnemy === bestDistanceToEnemy && bestPosition) {
          const candidateEffort = manhattanDistance(battleUnit.position, candidate);
          const bestEffort = manhattanDistance(battleUnit.position, bestPosition);
          if (candidateEffort < bestEffort) bestPosition = candidate;
        }
      }
    }

    return bestPosition;
  }

  async #findBestCast(battleUnit: BattleUnit, enemies: BattleUnit[]): Promise<PlannedCast | null> {
    const usableAbilities: Array<{ abilityId: string; power: number; ability: AbilityDTO }> = [];

    for (const battleUnitAbility of battleUnit.toDto().abilities) {
      if (battleUnitAbility.cooldownTurnsLeft > 0) continue;

      const ability = await this.abilityRepository.searchById(battleUnitAbility.abilityId);
      if (!ability) continue;
      const abilityDto = ability.toDto();
      if (battleUnit.remainingMana < abilityDto.cost) continue;

      let power = 0;
      for (const effectId of abilityDto.effectIds) {
        const effect = await this.effectRepository.searchById(effectId);
        if (effect) power = Math.max(power, effect.toDto().power);
      }
      usableAbilities.push({ abilityId: abilityDto.id, power, ability: abilityDto });
    }

    usableAbilities.sort((a, b) => b.power - a.power);

    for (const usable of usableAbilities) {
      const targetIds = this.#findTargetsInRange(battleUnit, usable.ability, enemies);
      if (targetIds) return { abilityId: usable.abilityId, targetIds };
    }

    return null;
  }

  #findTargetsInRange(caster: BattleUnit, ability: AbilityDTO, enemies: BattleUnit[]): string[] | null {
    if (ability.targetPattern === TargetPattern.Self) {
      return [caster.id];
    }
    const target = enemies.find((enemy) => manhattanDistance(caster.position, enemy.position) === 1);
    return target ? [target.id] : null;
  }
}
