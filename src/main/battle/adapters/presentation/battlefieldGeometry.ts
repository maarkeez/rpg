import { TargetPattern, type AbilityDTO } from '../../../ability/domain';
import { manhattanDistance, positionsEqual, type BattleUnitDTO, type Position } from '../../../battleUnit/domain';

export function isWithinBounds(position: Position, rows: number, cols: number): boolean {
  return position.row >= 0 && position.row < rows && position.col >= 0 && position.col < cols;
}

export function findBattleUnitAt(battleUnits: BattleUnitDTO[], position: Position): BattleUnitDTO | undefined {
  return battleUnits.find(
    (battleUnit) => !battleUnit.isDefeated && positionsEqual(battleUnit.position, position),
  );
}

export function movementRangeTiles(
  battleUnit: BattleUnitDTO,
  battleUnits: BattleUnitDTO[],
  rows: number,
  cols: number,
): Position[] {
  const tiles: Position[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const position = { row, col };
      if (positionsEqual(position, battleUnit.position)) continue;
      if (manhattanDistance(battleUnit.position, position) > battleUnit.remainingMoveSteps) continue;
      if (findBattleUnitAt(battleUnits, position)) continue;
      tiles.push(position);
    }
  }
  return tiles;
}

export function abilityTargetTiles(
  caster: BattleUnitDTO,
  ability: AbilityDTO,
  battleUnits: BattleUnitDTO[],
  rows: number,
  cols: number,
): Position[] {
  if (ability.targetPattern === TargetPattern.Self) {
    return [caster.position];
  }

  const neighbours = [
    { row: caster.position.row - 1, col: caster.position.col },
    { row: caster.position.row + 1, col: caster.position.col },
    { row: caster.position.row, col: caster.position.col - 1 },
    { row: caster.position.row, col: caster.position.col + 1 },
  ];

  return neighbours.filter((position) => {
    if (!isWithinBounds(position, rows, cols)) return false;
    const occupant = findBattleUnitAt(battleUnits, position);
    return !occupant || occupant.playerId !== caster.playerId;
  });
}
