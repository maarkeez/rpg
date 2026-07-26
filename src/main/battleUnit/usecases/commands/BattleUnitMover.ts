import {
  BattleUnitNotFound,
  BattleUnitPositionOccupied,
  positionsEqual,
  type BattleUnitRepository,
  type Position,
} from '../../domain';
import { BattlefieldNotFound, type BattlefieldRepository } from '../../../battlefield/domain';

export class BattleUnitMover {
  constructor(
    readonly battleUnitRepository: BattleUnitRepository,
    readonly battlefieldRepository: BattlefieldRepository,
    readonly battlefieldId: string,
  ) {}

  async move(battleUnitId: string, destination: Position): Promise<void> {
    const battleUnit = await this.battleUnitRepository.searchById(battleUnitId);
    if (!battleUnit) throw new BattleUnitNotFound();

    const battlefield = await this.battlefieldRepository.searchById(this.battlefieldId);
    if (!battlefield) throw new BattlefieldNotFound();

    const origin = battleUnit.position;
    if (!positionsEqual(origin, destination) && !battlefield.isVacant(destination)) {
      throw new BattleUnitPositionOccupied();
    }

    battleUnit.move(destination);
    await this.battleUnitRepository.update(battleUnit);

    battlefield.moveOccupant(origin, destination, battleUnitId);
    await this.battlefieldRepository.update(battlefield);
  }
}
