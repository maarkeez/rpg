import { InMemoryEffectRepository } from '../../../effect/adapters/storage/InMemoryEffectRepository';
import { type EffectRepository } from '../../../effect/domain';
import { InMemoryAbilityRepository } from '../../../ability/adapters/storage/InMemoryAbilityRepository';
import { type AbilityRepository } from '../../../ability/domain';
import { InMemoryUnitRepository } from '../../../unit/adapters/storage/InMemoryUnitRepository';
import { type UnitRepository } from '../../../unit/domain';
import { InMemoryPlayerRepository } from '../../../player/adapters/storage/InMemoryPlayerRepository';
import { type PlayerRepository } from '../../../player/domain';
import { InMemoryBattleUnitRepository } from '../../../battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { type BattleUnitRepository } from '../../../battleUnit/domain';
import { InMemoryBattleRepository } from '../storage/InMemoryBattleRepository';
import { type BattleRepository } from '../../domain';
import { InMemoryBattlefieldRepository } from '../../../battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { type BattlefieldRepository } from '../../../battlefield/domain';
import {
  BattleInitializer,
  GOBLIN_ABILITY,
  GOBLIN_UNIT_ID,
  KNIGHT_ABILITY,
  KNIGHT_UNIT_ID,
  UNIT_TEMPLATES,
} from '../../../battleSetup/usecases/commands/BattleInitializer';

export const BATTLEFIELD_ROWS = 8;
export const BATTLEFIELD_COLS = 8;

export const ABILITY_DEFINITIONS = [
  { id: KNIGHT_ABILITY.id, name: KNIGHT_ABILITY.name, emoji: KNIGHT_ABILITY.emoji, description: KNIGHT_ABILITY.description },
  { id: GOBLIN_ABILITY.id, name: GOBLIN_ABILITY.name, emoji: GOBLIN_ABILITY.emoji, description: GOBLIN_ABILITY.description },
];

export const UNIT_EMOJI: Record<string, string> = {
  [KNIGHT_UNIT_ID]: UNIT_TEMPLATES[KNIGHT_UNIT_ID].emoji,
  [GOBLIN_UNIT_ID]: UNIT_TEMPLATES[GOBLIN_UNIT_ID].emoji,
};

export const UNIT_NAME: Record<string, string> = {
  [KNIGHT_UNIT_ID]: UNIT_TEMPLATES[KNIGHT_UNIT_ID].name,
  [GOBLIN_UNIT_ID]: UNIT_TEMPLATES[GOBLIN_UNIT_ID].name,
};

export const BATTLE_ID = 'battle-1';
export const BATTLEFIELD_ID = 'battlefield-1';
export const HUMAN_PLAYER_ID = 'human-player';
export const CPU_PLAYER_ID = 'cpu-player';

export type DemoGame = {
  battleId: string;
  battlefieldId: string;
  humanPlayerId: string;
  cpuPlayerId: string;
  effectRepository: EffectRepository;
  abilityRepository: AbilityRepository;
  unitRepository: UnitRepository;
  playerRepository: PlayerRepository;
  battleUnitRepository: BattleUnitRepository;
  battleRepository: BattleRepository;
  battlefieldRepository: BattlefieldRepository;
};

export async function seedDemoGame(): Promise<DemoGame> {
  const effectRepository = new InMemoryEffectRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const unitRepository = new InMemoryUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const battleUnitRepository = new InMemoryBattleUnitRepository();
  const battleRepository = new InMemoryBattleRepository();
  const battlefieldRepository = new InMemoryBattlefieldRepository();

  const battleInitializer = new BattleInitializer(
    battleRepository,
    playerRepository,
    unitRepository,
    abilityRepository,
    effectRepository,
    battleUnitRepository,
    battlefieldRepository,
  );

  await battleInitializer.initialize({
    battleId: BATTLE_ID,
    battlefieldId: BATTLEFIELD_ID,
    humanPlayerId: HUMAN_PLAYER_ID,
    cpuPlayerId: CPU_PLAYER_ID,
    rows: BATTLEFIELD_ROWS,
    cols: BATTLEFIELD_COLS,
    terrainId: 'Grass',
  });

  return {
    battleId: BATTLE_ID,
    battlefieldId: BATTLEFIELD_ID,
    humanPlayerId: HUMAN_PLAYER_ID,
    cpuPlayerId: CPU_PLAYER_ID,
    effectRepository,
    abilityRepository,
    unitRepository,
    playerRepository,
    battleUnitRepository,
    battleRepository,
    battlefieldRepository,
  };
}
