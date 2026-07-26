import { BattlefieldNotFound, type BattlefieldRepository } from '../../domain';
import { type Position } from '../../../battleUnit/domain';

export class BattleUnitBattlefieldRemover {
  constructor(readonly battlefieldRepository: BattlefieldRepository) {}

  async remove(battlefieldId: string, position: Position): Promise<void> {
    const battlefield = await this.battlefieldRepository.searchById(battlefieldId);
    if (!battlefield) throw new BattlefieldNotFound();

    battlefield.vacate(position);
    await this.battlefieldRepository.update(battlefield);
  }
}
