import { InMemoryEffectRepository } from '../../../effect/adapters/storage/InMemoryEffectRepository';
import { EffectCreator } from '../../../effect/usecases/commands/EffectCreator';
import { type EffectRepository } from '../../../effect/domain';
import { InMemoryAbilityRepository } from '../../../ability/adapters/storage/InMemoryAbilityRepository';
import { AbilityCreator } from '../../../ability/usecases/commands/AbilityCreator';
import { type AbilityRepository } from '../../../ability/domain';
import { InMemoryUnitRepository } from '../../../unit/adapters/storage/InMemoryUnitRepository';
import { UnitCreator } from '../../../unit/usecases/commands/UnitCreator';
import { type UnitRepository } from '../../../unit/domain';
import { InMemoryPlayerRepository } from '../../../player/adapters/storage/InMemoryPlayerRepository';
import { PlayerCreator } from '../../../player/usecases/commands/PlayerCreator';
import { type PlayerRepository } from '../../../player/domain';
import { InMemoryBattleUnitRepository } from '../../../battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { BattleUnitDeployer } from '../../../battleUnit/usecases/commands/BattleUnitDeployer';
import { type BattleUnitRepository } from '../../../battleUnit/domain';
import { InMemoryBattleRepository } from '../storage/InMemoryBattleRepository';
import { FirstRoundStarter } from '../../usecases/commands/FirstRoundStarter';
import { type BattleRepository } from '../../domain';

export const BATTLEFIELD_ROWS = 8;
export const BATTLEFIELD_COLS = 8;

export const ABILITY_DEFINITIONS = [
  { id: 'fire-bolt', name: 'Fire bolt', emoji: '🔥', description: 'Throws a ball of fire', cost: 10, cooldown: 2, effect: { id: 'burn', type: 'DealDamage' as const, power: 20, probability: 100, duration: 3 } },
  { id: 'spark', name: 'Spark', emoji: '⚡', description: 'Zaps the target with lightning', cost: 8, cooldown: 1, effect: { id: 'shock', type: 'DealDamage' as const, power: 12, probability: 90, duration: 0 } },
  { id: 'natures-touch', name: "Nature's touch", emoji: '🌿', description: 'Channels natural energy to mend wounds', cost: 12, cooldown: 3, effect: { id: 'regrowth', type: 'Heal' as const, power: 25, probability: 100, duration: 0 } },
  { id: 'tide', name: 'Tide', emoji: '🌑', description: 'Summons a wave of dark water', cost: 10, cooldown: 2, effect: { id: 'soak', type: 'DealDamage' as const, power: 15, probability: 100, duration: 0 } },
  { id: 'rockfall', name: 'Rockfall', emoji: '🪨', description: 'Drops a boulder on the target', cost: 15, cooldown: 3, effect: { id: 'crush', type: 'DealDamage' as const, power: 28, probability: 85, duration: 0 } },
  { id: 'tornado', name: 'Tornado', emoji: '🌪️', description: 'Whips up a violent gust of wind', cost: 10, cooldown: 2, effect: { id: 'gust', type: 'DealDamage' as const, power: 18, probability: 95, duration: 0 } },
] as const;

export const UNIT_EMOJI: Record<string, string> = {
  'goblin-unit': '👹',
};

export type DemoGame = {
  battleId: string;
  playerOneId: string;
  playerTwoId: string;
  allyBattleUnitId: string;
  enemyBattleUnitId: string;
  effectRepository: EffectRepository;
  abilityRepository: AbilityRepository;
  unitRepository: UnitRepository;
  playerRepository: PlayerRepository;
  battleUnitRepository: BattleUnitRepository;
  battleRepository: BattleRepository;
};

export async function seedDemoGame(): Promise<DemoGame> {
  const effectRepository = new InMemoryEffectRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const unitRepository = new InMemoryUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const battleUnitRepository = new InMemoryBattleUnitRepository();
  const battleRepository = new InMemoryBattleRepository();

  const effectCreator = new EffectCreator(effectRepository);
  const abilityCreator = new AbilityCreator(abilityRepository, effectRepository);

  for (const ability of ABILITY_DEFINITIONS) {
    await effectCreator.create(
      ability.effect.id,
      ability.effect.type,
      ability.effect.duration,
      ability.effect.power,
      ability.effect.probability,
    );
    await abilityCreator.create(
      ability.id,
      ability.name,
      ability.cost,
      ability.cooldown,
      [ability.effect.id],
      ability.id === 'natures-touch' ? 'Self' : 'AdjacentEnemy',
    );
  }

  await new UnitCreator(unitRepository, abilityRepository).create(
    'goblin-unit',
    'Goblin',
    100,
    100,
    ABILITY_DEFINITIONS.map((ability) => ability.id),
    3,
  );

  const playerCreator = new PlayerCreator(playerRepository);
  await playerCreator.create('player-one', 'human', 'Player one');
  await playerCreator.create('player-two', 'cpu', 'Player two');

  const battleUnitDeployer = new BattleUnitDeployer(battleUnitRepository, unitRepository, playerRepository);
  await battleUnitDeployer.deploy('ally-battle-unit', 'goblin-unit', 'player-one', { row: 6, col: 3 });
  await battleUnitDeployer.deploy('enemy-battle-unit', 'goblin-unit', 'player-two', { row: 5, col: 3 });

  await new FirstRoundStarter(battleRepository, playerRepository).start('battle-1', ['player-one', 'player-two']);

  return {
    battleId: 'battle-1',
    playerOneId: 'player-one',
    playerTwoId: 'player-two',
    allyBattleUnitId: 'ally-battle-unit',
    enemyBattleUnitId: 'enemy-battle-unit',
    effectRepository,
    abilityRepository,
    unitRepository,
    playerRepository,
    battleUnitRepository,
    battleRepository,
  };
}
