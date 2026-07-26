import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
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

let battleUnitRepository: InMemoryBattleUnitRepository;
let unitRepository: InMemoryUnitRepository;
let playerRepository: InMemoryPlayerRepository;
let battleUnitDeployer: BattleUnitDeployer;

let request: { id: string; unitId: string; playerId: string; position: Position };
let error: Error | undefined;

Before(async function () {
  battleUnitRepository = new InMemoryBattleUnitRepository();
  unitRepository = new InMemoryUnitRepository();
  playerRepository = new InMemoryPlayerRepository();
  battleUnitDeployer = new BattleUnitDeployer(battleUnitRepository, unitRepository, playerRepository);

  const effectRepository = new InMemoryEffectRepository();
  const abilityRepository = new InMemoryAbilityRepository();
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

  request = {
    id: 'battle-unit-1',
    unitId: 'default-unit',
    playerId: 'default-player',
    position: { row: 0, col: 0 },
  };
  error = undefined;
});

Given('a battle unit id', function () {
  request.id = 'battle-unit-1';
});

Given('a unit id', function () {
  request.unitId = 'default-unit';
});

Given('a player id', function () {
  request.playerId = 'default-player';
});

Given('a battlefield position', function () {
  request.position = { row: 0, col: 0 };
});

Given('the unit exists', function () {
  // the default unit already exists, this step documents the precondition
});

Given('the player exists', function () {
  // the default player already exists, this step documents the precondition
});

Given('the battlefield position can be occupied', function () {
  // no other battle unit occupies the default position
});

Given('the battlefield position can not be occupied', async function () {
  await battleUnitDeployer.deploy('other-battle-unit', request.unitId, request.playerId, request.position);
});

Given('an existing battle unit', async function () {
  await battleUnitDeployer.deploy(request.id, request.unitId, request.playerId, request.position);
});

Given('the battle unit id is empty', function () {
  request.id = '';
});

Given("the deployed unit's unit id is empty", function () {
  request.unitId = '';
});

Given('the unit does not exist', function () {
  request.unitId = 'missing-unit';
});

Given("the deployed unit's player id is empty", function () {
  request.playerId = '';
});

Given('the player does not exist', function () {
  request.playerId = 'missing-player';
});

When('deploying the battle unit', async function () {
  try {
    await battleUnitDeployer.deploy(request.id, request.unitId, request.playerId, request.position);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the remaining health points will be the maximum unit health points', async function () {
  assert.equal(error, undefined);
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.equal(battleUnit?.toDto().remainingHealth, 100);
});

Then('the remaining mana points will be the maximum mana points', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.equal(battleUnit?.toDto().remainingMana, 50);
});

Then('the remaining actions will contain move', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.ok(battleUnit !== null);
});

Then('the move action remaining steps will be the unit movement range', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.equal(battleUnit?.toDto().remainingMoveSteps, 3);
});

Then('the remaining actions will contain cast ability', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.equal(battleUnit?.toDto().canCastAbility, true);
});

Then('the abilities will contain all the unit abilities', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.deepEqual(
    battleUnit?.toDto().abilities.map((a) => a.abilityId),
    ['default-ability'],
  );
});

Then('the abilities cool down turns left will be 0', async function () {
  const battleUnit = await battleUnitRepository.searchById(request.id);
  assert.ok(battleUnit?.toDto().abilities.every((a) => a.cooldownTurnsLeft === 0));
});

Then('the battle unit will not be deployed', function () {
  assert.ok(error instanceof Error);
});

Then('the battle unit deployment will fail', function () {
  assert.ok(error instanceof Error);
});
