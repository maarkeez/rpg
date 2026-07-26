import { BattlefieldNotFound, type Battlefield, type BattlefieldRepository } from '../../domain';
import { type Position } from '../../../battleUnit/domain';

export class BattlefieldOccupancyUpdater {
  constructor(readonly battlefieldRepository: BattlefieldRepository) {}

  async occupy(battlefieldId: string, position: Position, battleUnitId: string): Promise<void> {
    const battlefield = await this.#find(battlefieldId);
    battlefield.occupy(position, battleUnitId);
    await this.battlefieldRepository.update(battlefield);
  }

  async move(battlefieldId: string, from: Position, to: Position, battleUnitId: string): Promise<void> {
    const battlefield = await this.#find(battlefieldId);
    battlefield.moveOccupant(from, to, battleUnitId);
    await this.battlefieldRepository.update(battlefield);
  }

  async #find(battlefieldId: string): Promise<Battlefield> {
    const battlefield = await this.battlefieldRepository.searchById(battlefieldId);
    if (!battlefield) throw new BattlefieldNotFound();
    return battlefield;
  }
}
