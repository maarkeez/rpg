import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { PlayerDefeater } from '../../../main/battle/usecases/commands/PlayerDefeater';
import { BattleFinisher } from '../../../main/battle/usecases/commands/BattleFinisher';
import { AbilityEffectReceiver } from '../../../main/battleUnit/usecases/commands/AbilityEffectReceiver';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { EffectType } from '../../../main/effect/domain';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';

const battleId = 'battle-1';
const battlefieldId = 'battlefield-1';

let battleRepository: InMemoryBattleRepository;
let battleFinisher: BattleFinisher;
let error: Error | undefined;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  const battleUnitRepository = new InMemoryBattleUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  const battlefieldRepository = new InMemoryBattlefieldRepository();
  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');

  const playerDefeater = new PlayerDefeater(battleRepository, battleUnitRepository);
  const effectReceiver = new AbilityEffectReceiver(battleUnitRepository);
  battleFinisher = new BattleFinisher(battleRepository);
  error = undefined;

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');
  await new FirstRoundStarter(battleRepository, playerRepository).start(battleId, ['player-one', 'player-two']);

  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'default-ability',
    'Fire bolt',
    10,
    2,
    ['default-effect'],
    'AdjacentEnemy',
  );
  await new UnitCreator(unitRepository, abilityRepository).create(
    'default-unit',
    'Goblin',
    100,
    50,
    ['default-ability'],
    3,
  );

  const battleUnitDeployer = new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  );
  await battleUnitDeployer.deploy('player-two-unit', 'default-unit', 'player-two', { row: 0, col: 0 });

  await effectReceiver.receive('player-two-unit', EffectType.DealDamage, 100);
  await playerDefeater.defeat(battleId, 'player-two');
});

Given('a defeated player', function () {
  // player-two was already defeated and removed from the turn queue in the Before hook
});

Given('the battle turn queue contains a single player', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.deepEqual(battle?.toDto().turnQueue, ['player-one']);
});

When('finish the battle', async function () {
  try {
    await battleFinisher.finish(battleId);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the remaining player in the turn queue won the battle', async function () {
  assert.equal(error, undefined);
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().winner, 'player-one');
});
