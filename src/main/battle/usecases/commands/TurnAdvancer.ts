import { BattleNotFound, type BattleDTO, type BattleRepository } from '../../domain';
import { type BattleUnitRepository } from '../../../battleUnit/domain';

export class TurnAdvancer {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly battleUnitRepository: BattleUnitRepository,
  ) {}

  async advance(battleId: string): Promise<BattleDTO> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    battle.advanceTurn();
    await this.battleRepository.update(battle);

    const nextPlayerId = battle.toDto().currentPlayerTurn;
    const nextPlayerBattleUnits = await this.battleUnitRepository.searchByPlayerId(nextPlayerId);
    for (const battleUnit of nextPlayerBattleUnits) {
      battleUnit.beginTurn();
      await this.battleUnitRepository.update(battleUnit);
    }

    return battle.toDto();
  }
}
