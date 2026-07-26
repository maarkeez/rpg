import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { BattleUnitMover } from '../../../main/battleUnit/usecases/commands/BattleUnitMover';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { type Position } from '../../../main/battleUnit/domain';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';

const battlefieldId = 'battlefield-1';

let battleUnitRepository: InMemoryBattleUnitRepository;
let battlefieldRepository: InMemoryBattlefieldRepository;
let battleUnitMover: BattleUnitMover;

const battleUnitId = 'battle-unit-1';
let destination: Position;
let error: Error | undefined;

Before(async function () {
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const unitRepository = new InMemoryUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  battlefieldRepository = new InMemoryBattlefieldRepository();
  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');
  battleUnitMover = new BattleUnitMover(battleUnitRepository, battlefieldRepository, battlefieldId);

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
  await new PlayerCreator(playerRepository).create('default-player', 'human', 'Player One');

  await new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  ).deploy(battleUnitId, 'default-unit', 'default-player', { row: 0, col: 0 });

  destination = { row: 0, col: 1 };
  error = undefined;
});

Given('a deployed battle unit', function () {
  // the battle unit is deployed in the Before hook, with 3 movement steps left
});

Given('the battle unit has movements left', function () {
  // the battle unit starts with its full movement range available
});

Given('the destination position can be occupied', function () {
  // the destination tile is empty by default
});

Given('the battle unit exhausted their movements', function () {
  destination = { row: 0, col: 5 };
});

Given('the destination position can not be occupied', async function () {
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  const playerRepository = new InMemoryPlayerRepository();
  await new EffectCreator(effectRepository).create('blocker-effect', 'Heal', 0, 10, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'blocker-ability',
    'Fire bolt',
    10,
    2,
    ['blocker-effect'],
    'AdjacentEnemy',
  );
  await new UnitCreator(unitRepository, abilityRepository).create(
    'blocker-unit',
    'Goblin',
    100,
    50,
    ['blocker-ability'],
    3,
  );
  await new PlayerCreator(playerRepository).create('blocker-player', 'human', 'Player Two');
  await new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  ).deploy('blocker-battle-unit', 'blocker-unit', 'blocker-player', destination);
});

When('moving the battle unit', async function () {
  try {
    await battleUnitMover.move(battleUnitId, destination);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('battle unit will be moved', async function () {
  assert.equal(error, undefined);
  const battleUnit = await battleUnitRepository.searchById(battleUnitId);
  assert.deepEqual(battleUnit?.position, destination);
});

Then('battle unit movement will fail', function () {
  assert.ok(error instanceof Error);
});
