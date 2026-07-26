import { BattleUnitNotFound, type BattleUnitRepository } from '../../domain';

export class BattleUnitTurnStarter {
  constructor(readonly battleUnitRepository: BattleUnitRepository) {}

  async beginTurn(battleUnitId: string): Promise<void> {
    const battleUnit = await this.battleUnitRepository.searchById(battleUnitId);
    if (!battleUnit) throw new BattleUnitNotFound();

    battleUnit.beginTurn();
    await this.battleUnitRepository.update(battleUnit);
  }
}
