import {
  BattleUnit,
  BattleUnitAlreadyDeployed,
  BattleUnitIdRequired,
  BattleUnitPlayerIdRequired,
  BattleUnitPlayerNotFound,
  BattleUnitPositionOccupied,
  BattleUnitUnitIdRequired,
  BattleUnitUnitNotFound,
  type BattleUnitRepository,
  type Position,
} from '../../domain';
import { type PlayerRepository } from '../../../player/domain';
import { type UnitRepository } from '../../../unit/domain';
import { BattlefieldNotFound, type BattlefieldRepository } from '../../../battlefield/domain';

export class BattleUnitDeployer {
  constructor(
    readonly battleUnitRepository: BattleUnitRepository,
    readonly unitRepository: UnitRepository,
    readonly playerRepository: PlayerRepository,
    readonly battlefieldRepository: BattlefieldRepository,
    readonly battlefieldId: string,
  ) {}

  async deploy(id: string, unitId: string, playerId: string, position: Position): Promise<void> {
    const existing = await this.battleUnitRepository.searchById(id);
    if (existing) throw new BattleUnitAlreadyDeployed();

    if (!id) throw new BattleUnitIdRequired();
    if (!unitId) throw new BattleUnitUnitIdRequired();
    if (!playerId) throw new BattleUnitPlayerIdRequired();

    const unit = await this.unitRepository.searchById(unitId);
    if (!unit) throw new BattleUnitUnitNotFound();

    const player = await this.playerRepository.searchById(playerId);
    if (!player) throw new BattleUnitPlayerNotFound();

    const battlefield = await this.battlefieldRepository.searchById(this.battlefieldId);
    if (!battlefield) throw new BattlefieldNotFound();
    if (!battlefield.isVacant(position)) throw new BattleUnitPositionOccupied();

    const battleUnit = BattleUnit.deploy(
      id,
      unitId,
      playerId,
      position,
      unit.maxHealth,
      unit.maxMana,
      unit.movementRange,
      unit.abilityIds,
    );
    await this.battleUnitRepository.create(battleUnit);

    battlefield.occupy(position, id);
    await this.battlefieldRepository.update(battlefield);
  }
}
