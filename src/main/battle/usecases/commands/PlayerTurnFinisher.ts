import { BattleNotFound, type BattleRepository } from '../../domain';
import { type BattleUnitRepository } from '../../../battleUnit/domain';
import { beginPlayerBattleUnitsTurn } from './beginPlayerBattleUnitsTurn';

export class PlayerTurnFinisher {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly battleUnitRepository: BattleUnitRepository,
  ) {}

  async finish(battleId: string): Promise<void> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    battle.finishCurrentPlayerTurn();
    await this.battleRepository.update(battle);

    const battleDto = battle.toDto();
    if (!battleDto.roundFinished) {
      await beginPlayerBattleUnitsTurn(this.battleUnitRepository, battleDto.currentPlayerTurn);
    }
  }
}
