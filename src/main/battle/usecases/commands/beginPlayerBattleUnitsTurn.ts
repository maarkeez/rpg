import { type BattleUnitRepository } from '../../../battleUnit/domain';

export async function beginPlayerBattleUnitsTurn(
  battleUnitRepository: BattleUnitRepository,
  playerId: string,
): Promise<void> {
  const battleUnits = await battleUnitRepository.searchByPlayerId(playerId);
  for (const battleUnit of battleUnits) {
    battleUnit.beginTurn();
    await battleUnitRepository.update(battleUnit);
  }
}
