import { BattleNotFound, type BattleRepository } from '../../domain';
import { type BattleUnitRepository } from '../../../battleUnit/domain';
import { beginPlayerBattleUnitsTurn } from './beginPlayerBattleUnitsTurn';

export class RoundStarter {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly battleUnitRepository: BattleUnitRepository,
  ) {}

  async startNextRound(battleId: string): Promise<void> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    battle.startNextRound();
    await this.battleRepository.update(battle);

    await beginPlayerBattleUnitsTurn(this.battleUnitRepository, battle.toDto().currentPlayerTurn);
  }
}
