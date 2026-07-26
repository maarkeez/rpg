import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let unitRepository: InMemoryUnitRepository;
let abilityRepository: InMemoryAbilityRepository;
let unitCreator: UnitCreator;

let request: {
  id: string;
  name: string;
  maxHealth: number;
  maxMana: number;
  abilityIds: string[];
  movementRange: number;
};
let error: Error | undefined;

Before(async function () {
  unitRepository = new InMemoryUnitRepository();
  abilityRepository = new InMemoryAbilityRepository();
  unitCreator = new UnitCreator(unitRepository, abilityRepository);

  const effectRepository = new InMemoryEffectRepository();
  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'default-ability',
    'Fire bolt',
    10,
    2,
    ['default-effect'],
    'AdjacentEnemy',
  );
});

Given('a new unit', function () {
  request = {
    id: 'unit-1',
    name: 'Goblin',
    maxHealth: 100,
    maxMana: 50,
    abilityIds: ['default-ability'],
    movementRange: 3,
  };
  error = undefined;
});

Given('an existing unit', async function () {
  request = {
    id: 'unit-1',
    name: 'Goblin',
    maxHealth: 100,
    maxMana: 50,
    abilityIds: ['default-ability'],
    movementRange: 3,
  };
  error = undefined;
  await unitCreator.create(
    request.id,
    request.name,
    request.maxHealth,
    request.maxMana,
    request.abilityIds,
    request.movementRange,
  );
});

Given('the unit ability exists', function () {
  // the default ability already exists, this step documents the precondition
});

Given('the unit id is empty', function () {
  request.id = '';
});

Given('the unit name is empty', function () {
  request.name = '';
});

Given('the unit name is longer than 50 characters', function () {
  request.name = 'a'.repeat(51);
});

Given('the unit maximum health is negative', function () {
  request.maxHealth = -1;
});

Given('the unit maximum health is greater than 999', function () {
  request.maxHealth = 1000;
});

Given('the unit maximum mana is negative', function () {
  request.maxMana = -1;
});

Given('the unit maximum mana is greater than 999', function () {
  request.maxMana = 1000;
});

Given('the unit abilities are empty', function () {
  request.abilityIds = [];
});

Given('the unit has more than 6 abilities', function () {
  request.abilityIds = Array(7).fill('default-ability');
});

Given('the unit ability does not exist', function () {
  request.abilityIds = ['missing-ability'];
});

Given('the movement range is negative', function () {
  request.movementRange = -1;
});

Given('the movement range is greater than 99', function () {
  request.movementRange = 100;
});

When('the unit creation is requested', async function () {
  try {
    await unitCreator.create(
      request.id,
      request.name,
      request.maxHealth,
      request.maxMana,
      request.abilityIds,
      request.movementRange,
    );
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the unit will be created', async function () {
  assert.equal(error, undefined);
  const created = await unitRepository.searchById(request.id);
  assert.notEqual(created, null);
});

Then('the unit will not be created', function () {
  assert.ok(error instanceof Error);
});

Then('the unit creation will fail', function () {
  assert.ok(error instanceof Error);
});
