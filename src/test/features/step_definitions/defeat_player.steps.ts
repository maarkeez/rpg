import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { PlayerDefeater } from '../../../main/battle/usecases/commands/PlayerDefeater';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { AbilityEffectReceiver } from '../../../main/battleUnit/usecases/commands/AbilityEffectReceiver';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { EffectType } from '../../../main/effect/domain';

const battleId = 'battle-1';
const defeatedPlayerId = 'player-two';

let battleRepository: InMemoryBattleRepository;
let battleUnitRepository: InMemoryBattleUnitRepository;
let playerDefeater: PlayerDefeater;
let error: Error | undefined;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  const effectReceiver = new AbilityEffectReceiver(battleUnitRepository);
  playerDefeater = new PlayerDefeater(battleRepository, battleUnitRepository);

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create(defeatedPlayerId, 'cpu', 'Player Two');
  await new FirstRoundStarter(battleRepository, playerRepository).start(battleId, ['player-one', defeatedPlayerId]);

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

  await new BattleUnitDeployer(battleUnitRepository, unitRepository, playerRepository).deploy(
    'defeated-battle-unit',
    'default-unit',
    defeatedPlayerId,
    { row: 0, col: 0 },
  );
  await effectReceiver.receive('defeated-battle-unit', EffectType.DealDamage, 100);

  error = undefined;
});

Given('a defeated player unit', function () {
  // the player's only battle unit was reduced to zero health in the Before hook
});

Given('the player does not have more units alive', function () {
  // the player's only battle unit is already defeated
});

When('defeating the player', async function () {
  try {
    await playerDefeater.defeat(battleId, defeatedPlayerId);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the player is removed from the battle turn queue', async function () {
  assert.equal(error, undefined);
  const battle = await battleRepository.searchById(battleId);
  assert.ok(!battle?.toDto().turnQueue.includes(defeatedPlayerId));
});

Then('the player was defeated', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.deepEqual(battle?.toDto().turnQueue, ['player-one']);
});
