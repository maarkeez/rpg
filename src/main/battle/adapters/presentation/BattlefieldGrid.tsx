import { useBattle } from './BattleContext';
import { UNIT_EMOJI } from './seedDemoGame';
import { findBattleUnitAt } from './battlefieldGeometry';

export function BattlefieldGrid() {
  const { rows, cols, battle, battleUnits, selectedUnit, moveRangeTiles, targetTiles, selectTile } = useBattle();

  const isHighlighted = (row: number, col: number, tiles: { row: number; col: number }[]) =>
    tiles.some((tile) => tile.row === row && tile.col === col);

  return (
    <div className="battlefield" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="grid">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const occupant = findBattleUnitAt(battleUnits, { row, col });
          const isSelected = selectedUnit?.position.row === row && selectedUnit?.position.col === col;
          const classes = ['tile'];
          if (occupant) classes.push(occupant.playerId === battle?.currentPlayerTurn ? 'occupied-ally' : 'occupied-enemy');
          if (isSelected) classes.push('selected');
          if (isHighlighted(row, col, moveRangeTiles)) classes.push('move-range');
          if (isHighlighted(row, col, targetTiles)) classes.push('target-range');

          return (
            <button
              key={`${row}-${col}`}
              type="button"
              role="gridcell"
              aria-label={`tile-${row}-${col}`}
              title={occupant ? `${occupant.remainingHealth}/${occupant.maxHealth} HP` : undefined}
              className={classes.join(' ')}
              onClick={() => selectTile({ row, col })}
            >
              {occupant ? UNIT_EMOJI[occupant.unitId] ?? '🧍' : ''}
            </button>
          );
        }),
      )}
    </div>
  );
}
