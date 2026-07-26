import { BattleNotFound, BattlePlayerStillHasUnitsAlive, type BattleRepository } from '../../domain';
import { type BattleUnitRepository } from '../../../battleUnit/domain';

export class PlayerDefeater {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly battleUnitRepository: BattleUnitRepository,
  ) {}

  async defeat(battleId: string, playerId: string): Promise<void> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    const playerBattleUnits = await this.battleUnitRepository.searchByPlayerId(playerId);
    const hasUnitsAlive = playerBattleUnits.some((battleUnit) => !battleUnit.isDefeated);
    if (hasUnitsAlive) throw new BattlePlayerStillHasUnitsAlive();

    battle.defeatPlayer(playerId);
    await this.battleRepository.update(battle);
  }
}
