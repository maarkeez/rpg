import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedDemoGame, BATTLEFIELD_ROWS, BATTLEFIELD_COLS, type DemoGame } from './seedDemoGame';
import { abilityTargetTiles, findBattleUnitAt, movementRangeTiles } from './battlefieldGeometry';
import { type BattleDTO } from '../../domain';
import { TurnAdvancer } from '../../usecases/commands/TurnAdvancer';
import { type AbilityDTO } from '../../../ability/domain';
import { type EffectDTO } from '../../../effect/domain';
import { type BattleUnitDTO, type Position } from '../../../battleUnit/domain';
import { BattleUnitMover } from '../../../battleUnit/usecases/commands/BattleUnitMover';
import { AbilityCaster } from '../../../battleUnit/usecases/commands/AbilityCaster';

type BattleUiState = {
  isReady: boolean;
  battle: BattleDTO | null;
  battleUnits: BattleUnitDTO[];
  abilities: AbilityDTO[];
  effects: EffectDTO[];
  selectedUnitId: string | null;
  selectedAbilityId: string | null;
  isConfirmingFinishTurn: boolean;
  lastActionError: string | null;
};

type BattleUiValue = BattleUiState & {
  rows: number;
  cols: number;
  selectedUnit: BattleUnitDTO | null;
  selectedAbility: AbilityDTO | null;
  moveRangeTiles: Position[];
  targetTiles: Position[];
  selectTile: (position: Position) => void;
  selectAbility: (abilityId: string) => void;
  deselect: () => void;
  requestFinishTurn: () => void;
  cancelFinishTurn: () => void;
  confirmFinishTurn: () => Promise<void>;
  effectFor: (effectId: string) => EffectDTO | undefined;
};

const BattleUiContext = React.createContext<BattleUiValue | null>(null);

export function BattleProvider({ children }: { children?: React.ReactNode }) {
  const [game, setGame] = useState<DemoGame | null>(null);
  const [state, setState] = useState<BattleUiState>({
    isReady: false,
    battle: null,
    battleUnits: [],
    abilities: [],
    effects: [],
    selectedUnitId: null,
    selectedAbilityId: null,
    isConfirmingFinishTurn: false,
    lastActionError: null,
  });

  const refresh = useCallback(async (currentGame: DemoGame) => {
    const [battleUnits, battle, abilities, effects] = await Promise.all([
      currentGame.battleUnitRepository.searchAll(),
      currentGame.battleRepository.searchById(currentGame.battleId),
      Promise.all(
        (await currentGame.unitRepository.searchById('goblin-unit'))!.abilityIds.map((abilityId) =>
          currentGame.abilityRepository.searchById(abilityId),
        ),
      ),
      Promise.all(
        (await currentGame.unitRepository.searchById('goblin-unit'))!.abilityIds.map(async (abilityId) => {
          const ability = await currentGame.abilityRepository.searchById(abilityId);
          return ability ? currentGame.effectRepository.searchById(ability.effectIds[0]) : null;
        }),
      ),
    ]);

    setState((prev) => ({
      ...prev,
      isReady: true,
      battle: battle!.toDto(),
      battleUnits: battleUnits.map((battleUnit) => battleUnit.toDto()),
      abilities: abilities.filter((ability): ability is NonNullable<typeof ability> => ability !== null).map((a) => a.toDto()),
      effects: effects.filter((effect): effect is NonNullable<typeof effect> => effect !== null).map((e) => e.toDto()),
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    seedDemoGame().then((seededGame) => {
      if (cancelled) return;
      setGame(seededGame);
      refresh(seededGame);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const selectedUnit = useMemo(
    () => state.battleUnits.find((battleUnit) => battleUnit.id === state.selectedUnitId) ?? null,
    [state.battleUnits, state.selectedUnitId],
  );

  const selectedAbility = useMemo(
    () => state.abilities.find((ability) => ability.id === state.selectedAbilityId) ?? null,
    [state.abilities, state.selectedAbilityId],
  );

  const moveRangeTiles = useMemo(() => {
    if (!selectedUnit || selectedAbility) return [];
    return movementRangeTiles(selectedUnit, state.battleUnits, BATTLEFIELD_ROWS, BATTLEFIELD_COLS);
  }, [selectedUnit, selectedAbility, state.battleUnits]);

  const targetTiles = useMemo(() => {
    if (!selectedUnit || !selectedAbility) return [];
    return abilityTargetTiles(selectedUnit, selectedAbility, state.battleUnits, BATTLEFIELD_ROWS, BATTLEFIELD_COLS);
  }, [selectedUnit, selectedAbility, state.battleUnits]);

  const selectTile = useCallback(
    (position: Position) => {
      if (!game || !state.battle) return;

      if (selectedUnit && selectedAbility) {
        const isValidTarget = targetTiles.some((tile) => tile.row === position.row && tile.col === position.col);
        if (!isValidTarget) return;
        const target = findBattleUnitAt(state.battleUnits, position);
        const targetId = target ? target.id : selectedUnit.id;
        const abilityCaster = new AbilityCaster(game.battleUnitRepository, game.abilityRepository, game.effectRepository);
        abilityCaster
          .cast(selectedUnit.id, selectedAbility.id, [targetId])
          .then(() => {
            setState((prev) => ({ ...prev, selectedAbilityId: null, lastActionError: null }));
            return refresh(game);
          })
          .catch((error: Error) => setState((prev) => ({ ...prev, lastActionError: error.message })));
        return;
      }

      if (selectedUnit) {
        const isValidMove = moveRangeTiles.some((tile) => tile.row === position.row && tile.col === position.col);
        if (isValidMove) {
          const battleUnitMover = new BattleUnitMover(game.battleUnitRepository);
          battleUnitMover
            .move(selectedUnit.id, position)
            .then(() => {
              setState((prev) => ({ ...prev, lastActionError: null }));
              return refresh(game);
            })
            .catch((error: Error) => setState((prev) => ({ ...prev, lastActionError: error.message })));
          return;
        }
      }

      const occupant = findBattleUnitAt(state.battleUnits, position);
      if (occupant && occupant.playerId === state.battle.currentPlayerTurn) {
        setState((prev) => ({ ...prev, selectedUnitId: occupant.id, selectedAbilityId: null }));
      } else {
        setState((prev) => ({ ...prev, selectedUnitId: null, selectedAbilityId: null }));
      }
    },
    [game, state.battle, state.battleUnits, selectedUnit, selectedAbility, targetTiles, moveRangeTiles, refresh],
  );

  const selectAbilityAction = useCallback((abilityId: string) => {
    setState((prev) => ({
      ...prev,
      selectedAbilityId: prev.selectedAbilityId === abilityId ? null : abilityId,
    }));
  }, []);

  const deselect = useCallback(() => {
    setState((prev) => ({ ...prev, selectedUnitId: null, selectedAbilityId: null }));
  }, []);

  const requestFinishTurn = useCallback(() => {
    setState((prev) => ({ ...prev, isConfirmingFinishTurn: true }));
  }, []);

  const cancelFinishTurn = useCallback(() => {
    setState((prev) => ({ ...prev, isConfirmingFinishTurn: false }));
  }, []);

  const confirmFinishTurn = useCallback(async () => {
    if (!game) return;
    const turnAdvancer = new TurnAdvancer(game.battleRepository, game.battleUnitRepository);
    await turnAdvancer.advance(game.battleId);
    setState((prev) => ({
      ...prev,
      isConfirmingFinishTurn: false,
      selectedUnitId: null,
      selectedAbilityId: null,
    }));
    await refresh(game);
  }, [game, refresh]);

  const effectFor = useCallback(
    (effectId: string) => state.effects.find((effect) => effect.id === effectId),
    [state.effects],
  );

  const value: BattleUiValue = {
    ...state,
    rows: BATTLEFIELD_ROWS,
    cols: BATTLEFIELD_COLS,
    selectedUnit,
    selectedAbility,
    moveRangeTiles,
    targetTiles,
    selectTile,
    selectAbility: selectAbilityAction,
    deselect,
    requestFinishTurn,
    cancelFinishTurn,
    confirmFinishTurn,
    effectFor,
  };

  return <BattleUiContext.Provider value={value}>{children}</BattleUiContext.Provider>;
}

export function useBattle(): BattleUiValue {
  const context = useContext(BattleUiContext);
  if (!context) throw new Error('useBattle must be used within a BattleProvider');
  return context;
}
