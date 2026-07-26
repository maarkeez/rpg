import { BattleUnitNotFound, BattleUnitPositionOccupied, type BattleUnitRepository, type Position } from '../../domain';

export class BattleUnitMover {
  constructor(readonly battleUnitRepository: BattleUnitRepository) {}

  async move(battleUnitId: string, destination: Position): Promise<void> {
    const battleUnit = await this.battleUnitRepository.searchById(battleUnitId);
    if (!battleUnit) throw new BattleUnitNotFound();

    const occupant = await this.battleUnitRepository.searchByPosition(destination);
    if (occupant && occupant.id !== battleUnitId) throw new BattleUnitPositionOccupied();

    battleUnit.move(destination);
    await this.battleUnitRepository.update(battleUnit);
  }
}
